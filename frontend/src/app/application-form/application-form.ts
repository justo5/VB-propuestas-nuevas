import {
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { TIERS } from '../landing-data';
import { PlanSelection } from '../plan-selection';

interface InversionOption {
  value: string;
  label: string;
}

interface FormStep {
  fields: string[];
}

interface Turnstile {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

@Component({
  selector: 'app-application-form',
  imports: [ReactiveFormsModule],
  templateUrl: './application-form.html',
  styleUrl: './application-form.scss',
})
export class ApplicationForm {
  private readonly fb = new FormBuilder();
  private readonly http = inject(HttpClient);
  private readonly planSelection = inject(PlanSelection);

  protected readonly planOptions = TIERS.map((tier) => ({
    value: tier.name,
    label: `${tier.name} (${tier.price})`,
  }));

  protected readonly steps: FormStep[] = [
    { fields: ['plan'] },
    { fields: ['nombre', 'apellido'] },
    { fields: ['contacto', 'whatsapp'] },
    { fields: ['rubro'] },
    { fields: ['inversion', 'consentimiento'] },
  ];

  protected readonly inversionOptions: InversionOption[] = [
    { value: 'cero', label: 'USD 0, no invierto en anuncios' },
    { value: 'menos-300', label: 'Menos de USD 300' },
    { value: '300-700', label: 'De USD 300 a USD 700' },
    { value: '700-1500', label: 'De USD 700 a USD 1.500' },
    { value: 'mas-1500', label: 'Más de USD 1.500' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    plan: ['', Validators.required],
    nombre: ['', [Validators.required, Validators.maxLength(80)]],
    apellido: ['', [Validators.required, Validators.maxLength(80)]],
    contacto: ['', [Validators.required, Validators.maxLength(200)]],
    whatsapp: ['', [Validators.required, Validators.pattern(/^\+?[\d\s()-]{6,30}$/)]],
    rubro: ['', [Validators.required, Validators.maxLength(120)]],
    inversion: ['', Validators.required],
    consentimiento: [false, Validators.requiredTrue],
    // Honeypot: oculto para personas, los bots suelen completarlo.
    website: [''],
  });

  protected readonly currentStep = signal(0);
  protected readonly submitted = signal(false);
  protected readonly sending = signal(false);
  protected readonly submitError = signal<string | null>(null);

  private readonly turnstileSiteKey = signal<string | null>(null);
  private readonly turnstileToken = signal<string | null>(null);
  private readonly turnstileContainer = viewChild<ElementRef<HTMLElement>>('turnstile');
  private turnstileWidgetId: string | null = null;

  protected readonly progress = computed(
    () => ((this.currentStep() + 1) / this.steps.length) * 100,
  );

  constructor() {
    effect(() => {
      const plan = this.planSelection.selected();
      if (plan) {
        this.form.patchValue({ plan });
      }
    });

    this.loadConfig();

    // Renderiza el widget de Turnstile cuando aparece su contenedor (último paso).
    effect((onCleanup) => {
      const container = this.turnstileContainer();
      const siteKey = this.turnstileSiteKey();
      if (!container || !siteKey) {
        return;
      }

      let cancelled = false;
      let widgetId: string | null = null;
      loadTurnstile()
        .then((turnstile) => {
          if (cancelled) {
            return;
          }
          widgetId = turnstile.render(container.nativeElement, {
            sitekey: siteKey,
            language: 'es',
            callback: (token: string) => this.turnstileToken.set(token),
            'expired-callback': () => this.turnstileToken.set(null),
            'error-callback': () => this.turnstileToken.set(null),
          });
          this.turnstileWidgetId = widgetId;
        })
        .catch(() => this.submitError.set('No se pudo cargar la verificación anti-spam.'));

      onCleanup(() => {
        cancelled = true;
        if (widgetId) {
          window.turnstile?.remove(widgetId);
        }
        this.turnstileWidgetId = null;
        this.turnstileToken.set(null);
      });
    });
  }

  protected isInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && control.touched;
  }

  protected next(): void {
    const controls = this.steps[this.currentStep()].fields.map((field) => this.form.get(field)!);
    controls.forEach((control) => control.markAsTouched());

    if (!controls.every((control) => control.valid)) {
      return;
    }

    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update((step) => step + 1);
    } else {
      this.submit();
    }
  }

  protected prev(): void {
    this.submitError.set(null);
    this.currentStep.update((step) => Math.max(0, step - 1));
  }

  private async loadConfig(): Promise<void> {
    try {
      const config = await firstValueFrom(
        this.http.get<{ turnstileSiteKey: string | null }>('/api/config'),
      );
      this.turnstileSiteKey.set(config.turnstileSiteKey);
    } catch {
      // Sin configuración el formulario sigue funcionando; el backend decide si exige Turnstile.
    }
  }

  private async submit(): Promise<void> {
    if (this.sending()) {
      return;
    }
    if (this.turnstileSiteKey() && !this.turnstileToken()) {
      this.submitError.set('Esperá a que termine la verificación anti-spam e intentá de nuevo.');
      return;
    }

    this.sending.set(true);
    this.submitError.set(null);
    const value = this.form.getRawValue();

    try {
      await firstValueFrom(
        this.http.post('/api/aplicaciones', {
          ...value,
          turnstileToken: this.turnstileToken() ?? undefined,
        }),
      );
    } catch (error) {
      this.submitError.set(errorMessage(error));
      this.turnstileToken.set(null);
      if (this.turnstileWidgetId) {
        window.turnstile?.reset(this.turnstileWidgetId);
      }
      return;
    } finally {
      this.sending.set(false);
    }

    this.submitted.set(true);
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 429) {
      return 'Recibimos varios envíos seguidos. Esperá un minuto e intentá de nuevo.';
    }
    if (error.status === 400) {
      return 'Revisá los datos ingresados e intentá de nuevo.';
    }
    if (error.status === 403) {
      return 'No pudimos verificar que no seas un robot. Intentá de nuevo.';
    }
  }
  return 'No pudimos enviar tus datos. Intentá de nuevo en unos minutos.';
}

let turnstilePromise: Promise<Turnstile> | null = null;

function loadTurnstile(): Promise<Turnstile> {
  turnstilePromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT;
    script.async = true;
    script.onload = () => resolve(window.turnstile!);
    script.onerror = () => {
      turnstilePromise = null;
      reject(new Error('No se pudo cargar Turnstile'));
    };
    document.head.appendChild(script);
  });
  return turnstilePromise;
}
