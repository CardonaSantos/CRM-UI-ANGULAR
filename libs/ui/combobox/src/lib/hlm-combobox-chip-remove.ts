import { Directive } from '@angular/core';
import { BrnComboboxChipRemove } from '@spartan-ng/brain/combobox';
import { buttonVariants } from '@nova/ui/button';
import { classes } from '@nova/ui/utils';

@Directive({
	selector: 'button[hlmComboboxChipRemove]',
	exportAs: 'hlmComboboxChipRemove',
	hostDirectives: [BrnComboboxChipRemove],
	host: { 'data-slot': 'combobox-chip-remove' },
})
export class HlmComboboxChipRemove {
	constructor() {
		classes(() => ['-ms-1 opacity-50 hover:opacity-100', buttonVariants({ variant: 'ghost', size: 'icon-xs' })]);
	}
}
