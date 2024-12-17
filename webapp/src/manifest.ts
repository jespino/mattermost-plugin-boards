// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

declare var APP_TYPE: string

const manifest = require(APP_TYPE === 'pages' ? '../../plugin.pages.json' : '../../plugin.json')

export default manifest
export const id = manifest.id
export const version = manifest.version
