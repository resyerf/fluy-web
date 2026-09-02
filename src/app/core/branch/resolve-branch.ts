import { Router } from '@angular/router';
import { IdentityRepository } from '../../application/identity/identity-repository.port';
import { BranchService } from './branch.service';

/**
 * Post-login (CODE.md §9.25): 0 sedes → sigue de largo (tenant sin sedes configuradas, cero
 * regresión); 1 sede → se autoselecciona, sin preguntar nada; 2+ → pasa por /select-branch, que
 * resalta la de la última sesión si sigue siendo accesible, pero siempre deja elegir.
 */
export function resolveBranchAndNavigate(
  identityRepository: IdentityRepository,
  branchService: BranchService,
  router: Router
): void {
  identityRepository.getMyBranches().subscribe({
    next: (branches) => {
      if (branches.length === 0) {
        router.navigateByUrl('/requests');
      } else if (branches.length === 1) {
        branchService.setBranch(branches[0]);
        router.navigateByUrl('/requests');
      } else {
        router.navigateByUrl('/select-branch');
      }
    },
    error: () => router.navigateByUrl('/requests')
  });
}
