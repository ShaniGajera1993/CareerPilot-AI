# CareerPilot UX Contract

This contract records the interaction owners used across the authenticated workspace. Visual tokens remain governed by `DESIGN.md` and the runtime stylesheets.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | Native HTML select | This contract | Native single-select | Keyboard and browser smoke test |
| Form | Feature form plus shared API error normalizer | Frontend feature component and `frontend/src/services/api.ts` | Create and edit | Validation tests and browser flow |
| Scrollbar | Global application stylesheet | `DESIGN.md` and `frontend/src/index.css` | Browser default within bounded panels | Responsive browser inspection |
| Toast | Feature status or alert live region | Feature component | Success, information, and error | Accessibility inspection |
| CRUD | Versioned API controller and resource | `backend/routes/api.php` | Create, list, and edit where supported | Feature tests and browser flow |

## Behavioral rules

- Native selects are intentional: CareerPilot accepts the operating system's popup geometry and keyboard behavior for simple resume, role, and tone choices.
- Forms declare application-owned validation with `noValidate`, retain non-secret input after recoverable failures, and expose useful inline or form-level feedback.
- Long-running local AI actions disable duplicate submission, preserve their control footprint, explain the expected wait, and use extended client and server timeouts.
- Generated career content is saved only after the API confirms success. Model planning notes, empty output, and malformed structured output are rejected.
- Navigation controls either perform a real transition or clearly expose an unavailable state; decorative surfaces do not masquerade as controls.
