import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

/**
 * Shared chrome for every "create/edit X" dialog: an optional entity icon +
 * title + visible close button, a content body, and an actions footer.
 * Concrete dialogs keep their own form, validation and repository calls —
 * this only standardizes the header/body/footer markup so it isn't
 * hand-rolled in every dialog.
 *
 * Usage:
 *   <app-modal-shell title="Nuevo X" icon="domain" [closeDisabled]="saving()" (closed)="cancel()">
 *     ...form fields...
 *     <div modalFooter>
 *       <button mat-button (click)="cancel()">Cancelar</button>
 *       <button mat-flat-button color="primary" (click)="submit()">Guardar</button>
 *     </div>
 *   </app-modal-shell>
 */
@Component({
  selector: 'app-modal-shell',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './modal-shell.component.html',
  styleUrl: './modal-shell.component.scss'
})
export class ModalShellComponent {
  title = input.required<string>();
  icon = input<string | null>(null);
  closeDisabled = input(false);
  closed = output<void>();
}
