import { px } from "@zos/utils";

// Screen dimensions
export const screenWidth = px(480);
export const screenHeight = px(480);

// Page states
export const PAGE_MAIN = 0;
export const PAGE_KEYBOARD = 1;
export const PAGE_FAVORITES = 2;
export const PAGE_SETTINGS = 3;

// Keyboard layout
export const keyboardKeys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['DEL', '0', 'OK']
];

// Default styles for reusable components
export const STYLES = {
  // Title style
  TITLE: {
    x: px(20),
    y: px(40),
    w: px(440),
    h: px(50),
    color: 0xffffff,
    text_size: px(36),
    align_h: hmUI.align.CENTER_H
  },
  
  // Subtitle style
  SUBTITLE: {
    x: px(20),
    y: px(90),
    w: px(440),
    h: px(40),
    color: 0xffffff,
    text_size: px(28),
    align_h: hmUI.align.CENTER_H
  },
  
  // Standard button style
  BUTTON: {
    color: 0xffffff,
    normal_color: 0x333333,
    press_color: 0x555555,
    text_size: px(24),
    radius: px(15)
  },
  
  // Message text style
  MESSAGE: {
    color: 0xcccccc,
    text_size: px(24),
    align_h: hmUI.align.CENTER_H
  }
};