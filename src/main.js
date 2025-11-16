import channel from './services/broadcastChannel.js';
import LayoutComponent from './components/Layout.component.js';


function main() {
  channel.init();
  const layoutEl = new LayoutComponent();
  document.body.append(layoutEl);
}

main();

// Hello Carabistouille et patate frites