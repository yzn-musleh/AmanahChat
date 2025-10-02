import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatWidgetComponent } from "./components/widget-container/widget-container.component";
import { ChatWidgetConfig } from './Utils/Models';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatWidgetComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  chatConfig: ChatWidgetConfig = {
    theme: {
      primaryColor: '#4B1B5A',
      secondaryColor: '#000000',
      textPrimaryColor: '#ffffff',
      textSecondryColor: '#ffffff',
      backgroundColor: 'linear-gradient(267deg, #FFFFFF 0%, #56215E 100%)'
    },
    position: 'bottom-right',
    enableGuestUsers: true
  }
  protected title = 'ChatWidgetPlugin';

  constructor() {  
    this.applyTheme();
   }


  applyTheme() {
    const root = document.documentElement;

    root.style.setProperty('--primary-color', this.chatConfig?.theme?.primaryColor ?? '');
    root.style.setProperty('--secondary-color', this.chatConfig?.theme?.secondaryColor ?? '');
    root.style.setProperty('--background-color', this.chatConfig?.theme?.backgroundColor ?? '');
  }
}
