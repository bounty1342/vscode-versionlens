/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { inject } from '../../common/di';
import { PackageCodeLens } from '../../common/packageCodeLens';
import { PackageCodeLensList } from '../../common/packageCodeLensList';
import { AbstractCodeLensProvider } from '../abstractCodeLensProvider';
import { npmVersionParser } from './npmVersionParser';
import { jspmVersionParser } from './jspmVersionParser';

@inject('jsonParser', 'npm', 'appConfig', 'githubRequest')
export class NpmCodeLensProvider extends AbstractCodeLensProvider {

  constructor() {
    this.packageExtensions = {
      'jspm': jspmVersionParser
    };

    this.packageExtensionKeys = Object.keys(this.packageExtensions);

    this.packageDependencyKeys = [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies'
    ];
  }

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/package.json'
    }
  };

  provideCodeLenses(document, token) {
    const jsonDoc = this.jsonParser.parse(document.getText());
    if (!jsonDoc || !jsonDoc.root || jsonDoc.validationResult.errors.length > 0)
      return [];

    const collector = new PackageCodeLensList(document, this.appConfig);
    this.collectDependencies_(collector, jsonDoc.root, npmVersionParser);
    this.collectExtensionDependencies_(collector, jsonDoc.root);
    return collector.collection;
  }

  resolveCodeLens(codeLensItem, token) {
    if (codeLensItem instanceof PackageCodeLens) {
      if (codeLensItem.package.version === 'latest')
        return this.commandFactory.makeLatestCommand(codeLensItem);

      if (codeLensItem.package.meta) {
        if (codeLensItem.package.meta.type === 'github')
          return this.commandFactory.makeGithubCommand(codeLensItem);

        if (codeLensItem.package.meta.type === 'file')
          return this.commandFactory.makeLinkCommand(codeLensItem);
      }

      const viewPackageName = codeLensItem.package.name + (
        !codeLensItem.package.isValidSemver ?
          `@${codeLensItem.package.version}` :
          ''
      );

      return doNpmViewVersion(this.npm, viewPackageName)
        .then(response => {
          let keys = Object.keys(response);
          let remoteVersion = keys[0];

          if (codeLensItem.package.isValidSemver)
            return this.commandFactory.makeVersionCommand(
              codeLensItem.package.version,
              remoteVersion,
              codeLensItem
            );

          if (!remoteVersion)
            return this.commandFactory.makeErrorCommand(
              `${viewPackageName} gave an invalid response`,
              codeLensItem
            );

          return this.commandFactory.makeTagCommand(`${viewPackageName} = v${remoteVersion}`, codeLensItem);
        })
        .catch(error => {
          return this.commandFactory.makeErrorCommand(
            error,
            codeLensItem
          );
        });
    }
  }

  collectExtensionDependencies_(collector, rootNode) {
    rootNode.getChildNodes()
      .forEach(node => {
        const testDepProperty = node.key.value;
        if (this.packageExtensionKeys.includes(testDepProperty)) {
          const customParser = this.packageExtensions[testDepProperty];
          this.collectDependencies_(collector, node.value, customParser)
        }
      });
  }

}

function doNpmViewVersion(npm, packageName) {
  return new Promise((resolve, reject) => {
    npm.load(loadError => {
      if (loadError) {
        reject(loadError);
        return;
      }
      npm.view(packageName, 'version', (viewError, viewResult) => {
        if (viewError) {
          reject(viewError);
          return;
        }
        resolve(viewResult);
      });
    });
  });
}