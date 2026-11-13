/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Game from './components/Game';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-200 to-teal-100 text-slate-800 overflow-x-hidden font-sans selection:bg-emerald-300 selection:text-emerald-950">
      <Game />
    </div>
  );
}
