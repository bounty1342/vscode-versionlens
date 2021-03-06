/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// pacoteClientApi tests
import * as PacoteClientApi from './pacoteClientApi.tests.js';
export const PacoteClientApiTests = {
  PacoteClientApi
}

// npmPackageResolver tests
import resolveNpmPackage from './npmPackageResolver/resolveNpmPackage.tests.js';
import customGenerateVersion from './npmPackageResolver/customGenerateVersion.tests.js';
export const NPMPackageResolver = {
  resolveNpmPackage,
  customGenerateVersion,
}

// codeLensProvider tests
import evaluateCodeLens from './npmCodeLensProvider/evaluateCodeLens.tests.js'
import provideCodeLenses from './npmCodeLensProvider/provideCodeLenses.tests.js'

export const NPMCodeLensProvider = {
  evaluateCodeLens,
  provideCodeLenses,
}