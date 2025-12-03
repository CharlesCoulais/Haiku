import LayoutComponent from './components/Layout.component.js';
import { haikuReady$ } from './services/app.state.js';


function main() {
  const layoutEl = new LayoutComponent();
  document.body.append(layoutEl);
  haikuReady$.next(true);
}

main();

// Hello Carabistouille et patate frites