import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TIERS, WHATSAPP_NUMBER } from '../landing-data';
import { PlanSelection } from '../plan-selection';

interface InversionOption {
  value: string;
  label: string;
}

interface FormStep {
  fields: string[];
}

@Component({
  selector: 'app-application-form',
  imports: [ReactiveFormsModule],
  templateUrl: './application-form.html',
  styleUrl: './application-form.scss',
})
export class ApplicationForm {
  private readonly fb = new FormBuilder();
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
    { fields: ['inversion'] },
  ];

  protected readonly inversionOptions: InversionOption[] = [
    { value: 'menos-300', label: 'Menos de USD 300' },
    { value: '300-700', label: 'De USD 300 a USD 700' },
    { value: '700-1500', label: 'De USD 700 a USD 1.500' },
    { value: 'mas-1500', label: 'Más de USD 1.500' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    plan: ['', Validators.required],
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    contacto: ['', Validators.required],
    whatsapp: ['', Validators.required],
    rubro: ['', Validators.required],
    inversion: ['', Validators.required],
  });

  protected readonly currentStep = signal(0);
  protected readonly submitted = signal(false);
  protected readonly whatsappLink = signal<string | null>(null);

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
    this.currentStep.update((step) => Math.max(0, step - 1));
  }

  private submit(): void {
    const value = this.form.getRawValue();
    const inversionLabel =
      this.inversionOptions.find((option) => option.value === value.inversion)?.label ??
      value.inversion;

    const message = [
      'Hola! Quiero aplicar para trabajar con Vamos Bien.',
      `Plan: ${value.plan}`,
      `Nombre: ${value.nombre} ${value.apellido}`,
      `Sitio/Instagram: ${value.contacto}`,
      `WhatsApp: ${value.whatsapp}`,
      `Rubro: ${value.rubro}`,
      `Inversión actual en anuncios: ${inversionLabel}`,
    ].join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    this.whatsappLink.set(url);
    this.submitted.set(true);
    window.open(url, '_blank', 'noopener');
  }
}
