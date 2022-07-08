import { EventEmitter, ElementRef, NgZone, ViewContainerRef } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MbscScrollerBase, MbscInputService, MbscOptionsService } from './frameworks/angular';
import { Scroller, MbscScrollerOptions } from './classes/scroller';
export { MbscScrollerOptions };
export declare class MbscScroller extends MbscScrollerBase {
    optionService: MbscOptionsService;
    instance: Scroller;
    options: MbscScrollerOptions;
    value: string;
    onChangeEmitter: EventEmitter<string>;
    constructor(initialElement: ElementRef, zone: NgZone, control: NgControl, inputService: MbscInputService, optionService: MbscOptionsService, view: ViewContainerRef);
    setNewValue(v: string): void;
    initControl(): void;
}
export declare class MbscScrollerComponent extends MbscScroller {
    inputIcon: string;
    iconAlign: 'left' | 'right';
    name: string;
    error: boolean;
    errorMessage: string;
    options: MbscScrollerOptions;
    placeholder: string;
    constructor(initialElem: ElementRef, zone: NgZone, control: NgControl, inputService: MbscInputService, optionService: MbscOptionsService);
    ngAfterViewInit(): void;
}
export declare class MbscScrollerModule {
}
