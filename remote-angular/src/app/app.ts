import { Component, signal } from '@angular/core';
import { BoardComponent } from './board/board.component';

@Component({
  selector: 'app-root',
  imports: [BoardComponent],
  templateUrl: './app.html',
  styleUrls:['./app.css']
})
export class App {
  protected readonly title = signal('remote-angular');
}
