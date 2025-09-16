import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatWidgetComponent, ChatWidgetConfig } from "./components/widget-container/widget-container.component";
import { runPostSignalSetFn } from '@angular/core/primitives/signals';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatWidgetComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  chatConfig: ChatWidgetConfig = {
    theme: {
      primaryColor: 'fffff',
      secondaryColor: '00000',
      backgroundColor: '78787'
    },
    position: 'bottom-right',
    enableGuestUsers: true
  }
  protected title = 'ChatWidgetPlugin';


}
