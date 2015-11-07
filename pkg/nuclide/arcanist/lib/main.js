'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  BusySignalProviderBase as BusySignalProviderBaseT,
} from 'nuclide-busy-signal-provider-base';

import {CompositeDisposable} from 'atom';
import invariant from 'assert';

var subscriptions: ?CompositeDisposable = null;

let busySignalProvider: ?BusySignalProviderBaseT = null;

function getBusySignalProvider(): BusySignalProviderBaseT {
  if (busySignalProvider == null) {
    const {BusySignalProviderBase} = require('nuclide-busy-signal-provider-base');
    busySignalProvider = new BusySignalProviderBase();
  }
  return busySignalProvider;
}

module.exports = {

  config: {
    blacklistedLinters: {
      type: 'array',
      description: 'Comma-separated list of linter names that should not be displayed',
      // Flow wants this annotated.
      default: ([]: Array<string>),
      items: {
        type: 'string',
      },
    },
  },

  activate(): void {
    if (subscriptions) {
      return;
    }

    var {registerGrammarForFileExtension} = require('nuclide-atom-helpers');
    subscriptions = new CompositeDisposable();
    subscriptions.add(registerGrammarForFileExtension('source.json', '.arcconfig'));
  },

  dactivate(): void {
    if (subscriptions) {
      subscriptions.dispose();
      subscriptions = null;
    }
    busySignalProvider = null;
  },

  provideBusySignal(): BusySignalProvider {
    return getBusySignalProvider();
  },

  provideDiagnostics() {
    const {ArcanistDiagnosticsProvider} = require('./ArcanistDiagnosticsProvider');
    const provider = new ArcanistDiagnosticsProvider(getBusySignalProvider());
    invariant(subscriptions != null);
    subscriptions.add(provider);
    return provider;
  },
};
