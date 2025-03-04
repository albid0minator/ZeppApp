import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";
import { createWidget, widget, align, text_style, prop } from "@zos/ui";
import { STYLES, screenWidth, screenHeight, keyboardKeys } from "./styles";

export class TramUILayouts {
  constructor(pageInstance) {
    this.page = pageInstance;
    
    // Arrays to store widgets for cleanup
    this.scheduleWidgets = [];
    this.keyboardWidgets = [];
    this.favoritesWidgets = [];
    this.settingsWidgets = [];
    this.mainPageWidgets = [];
  }
  
  /* ==================== MAIN PAGE LAYOUT ==================== */
  
  createMainPage(currentStopCode, onEnterStopClick, onSettingsClick, onRefreshClick) {
    // Create title
    const titleText = createWidget(widget.TEXT, {
      ...STYLES.TITLE,
      text: "Torino Tram"
    });
    this.mainPageWidgets.push(titleText);
    
    // Display stop code in subtitle area
    const subtitleText = createWidget(widget.TEXT, {
      ...STYLES.SUBTITLE, 
      text: currentStopCode ? `Stop: ${currentStopCode}` : "Schedule"
    });
    this.mainPageWidgets.push(subtitleText);
    
    // Schedule container
    const scheduleContainer = createWidget(widget.GROUP, {
      x: px(20),
      y: px(130),
      w: px(440),
      h: px(240)
    });
    this.mainPageWidgets.push(scheduleContainer);
    
    // Three buttons at the bottom in a row
    const buttonY = px(380);
    const buttonWidth = px(120);
    const buttonSpacing = px(20);
    const startX = (screenWidth - (3 * buttonWidth + 2 * buttonSpacing)) / 2;
    
    // Create buttons using the standard style
    const enterStopButton = createWidget(widget.BUTTON, {
      ...STYLES.BUTTON,
      x: startX,
      y: buttonY,
      w: buttonWidth,
      h: px(70),
      text: "Enter Stop",
      click_func: onEnterStopClick
    });
    this.mainPageWidgets.push(enterStopButton);
    
    const settingsButton = createWidget(widget.BUTTON, {
      ...STYLES.BUTTON,
      x: startX + buttonWidth + buttonSpacing,
      y: buttonY,
      w: buttonWidth,
      h: px(70),
      text: "Menu",
      click_func: onSettingsClick
    });
    this.mainPageWidgets.push(settingsButton);
    
    const refreshButton = createWidget(widget.BUTTON, {
      ...STYLES.BUTTON,
      x: startX + 2 * (buttonWidth + buttonSpacing),
      y: buttonY,
      w: buttonWidth,
      h: px(70),
      text: "Refresh",
      click_func: onRefreshClick
    });
    this.mainPageWidgets.push(refreshButton);
    
    return {
      scheduleContainer
    };
  }
  
  /* ==================== SCHEDULE DISPLAY ==================== */
  
  displaySchedule(scheduleData) {
    // Limit to 3 arrivals to fit on screen
    const maxToShow = Math.min(3, scheduleData.length);
    
    for (let i = 0; i < maxToShow; i++) {
      const item = scheduleData[i];
      const isRealtime = item.realtime === "true";
      
      // Line number
      const lineText = createWidget(widget.TEXT, {
        x: px(20),
        y: px(150) + i * px(60),
        w: px(80),
        h: px(50),
        color: 0xffffff,
        text_size: px(30),
        align_h: align.CENTER_H,
        text: `Line ${item.line}`
      });
      
      // Arrival time
      const timeText = createWidget(widget.TEXT, {
        x: px(120),
        y: px(150) + i * px(60),
        w: px(170),
        h: px(50),
        color: isRealtime ? 0x00ff00 : 0xcccccc,
        text_size: px(26),
        align_h: align.CENTER_H,
        text: item.hour
      });
      
      // Realtime indicator
      const rtText = createWidget(widget.TEXT, {
        x: px(300),
        y: px(150) + i * px(60),
        w: px(160),
        h: px(50),
        color: isRealtime ? 0x00ff00 : 0xcccccc,
        text_size: px(20),
        align_h: align.CENTER_H,
        text: isRealtime ? "Real Time" : "Scheduled"
      });
      
      this.scheduleWidgets.push(lineText, timeText, rtText);
    }
  }
  
  displayNoSchedule(message = "No trams scheduled") {
    const noDataText = createWidget(widget.TEXT, {
      ...STYLES.MESSAGE,
      x: px(20),
      y: px(150),
      w: px(440),
      h: px(100),
      text: message
    });
    this.scheduleWidgets.push(noDataText);
  }
  
  /* ==================== KEYBOARD PAGE LAYOUT ==================== */
  
  createKeyboardPage(currentStopCode, onKeyPress, onBackClick, onSaveClick) {
    const titleText = createWidget(widget.TEXT, {
      ...STYLES.TITLE,
      text: "Enter Stop Code"
    });
    this.keyboardWidgets.push(titleText);
    
    const stopCodeText = createWidget(widget.TEXT, {
      ...STYLES.SUBTITLE,
      y: px(100),
      text: currentStopCode
    });
    this.keyboardWidgets.push(stopCodeText);
    
    // Keyboard container
    const keyboardContainer = createWidget(widget.GROUP, {
      x: px(40),
      y: px(160),
      w: px(400),
      h: px(240)
    });
    this.keyboardWidgets.push(keyboardContainer);
    
    // Generate keyboard
    this.createKeyboard(onKeyPress);
    
    // Two buttons side by side
    const buttonWidth = px(180);
    const spacing = px(20);
    const startX = (screenWidth - (2 * buttonWidth + spacing)) / 2;
    
    // Back button
    const backButton = createWidget(widget.BUTTON, {
      ...STYLES.BUTTON,
      x: startX,
      y: px(400),
      w: buttonWidth,
      h: px(60),
      text: "Back",
      click_func: onBackClick
    });
    this.keyboardWidgets.push(backButton);
    
    // Save button
    const saveButton = createWidget(widget.BUTTON, {
      ...STYLES.BUTTON,
      x: startX + buttonWidth + spacing,
      y: px(400),
      w: buttonWidth,
      h: px(60),
      text: "Save as Favorite",
      click_func: onSaveClick
    });
    this.keyboardWidgets.push(saveButton);
    
    return {
      stopCodeText
    };
  }
  
  createKeyboard(onKeyPress) {
    const keyWidth = px(90);
    const keyHeight = px(50);
    const spacingX = px(15);
    const spacingY = px(10);
    
    for (let row = 0; row < keyboardKeys.length; row++) {
      for (let col = 0; col < keyboardKeys[row].length; col++) {
        const key = keyboardKeys[row][col];
        const keyButton = createWidget(widget.BUTTON, {
          ...STYLES.BUTTON,
          x: col * (keyWidth + spacingX) + px(40),
          y: row * (keyHeight + spacingY) + px(160),
          w: keyWidth,
          h: keyHeight,
          text: key,
          text_size: px(20),
          normal_color: key === 'OK' ? 0x009900 : (key === 'DEL' ? 0x990000 : 0x333333),
          click_func: () => onKeyPress(key)
        });
        this.keyboardWidgets.push(keyButton);
      }
    }
  }
  
  /* ==================== SETTINGS PAGE LAYOUT ==================== */
  
  createSettingsPage(onFavoritesClick, onAddStopClick, onBackClick) {
    const titleText = createWidget(widget.TEXT, {
      ...STYLES.TITLE,
      text: "Settings"
    });
    this.settingsWidgets.push(titleText);
    
    // Settings container
    const settingsContainer = createWidget(widget.GROUP, {
      x: px(20),
      y: px(100),
      w: px(440),
      h: px(300)
    });
    this.settingsWidgets.push(settingsContainer);
    
    // Options list
    const optionHeight = px(70);
    const spacing = px(15);
    const buttonWidth = px(340);
    const startX = (screenWidth - buttonWidth) / 2;
    
    // Favorites button
    const favoritesButton = createWidget(widget.BUTTON, {
      ...STYLES.BUTTON,
      x: startX,
      y: px(120),
      w: buttonWidth,
      h: optionHeight,
      text: "Favorite Stops",
      click_func: onFavoritesClick
    });
    this.settingsWidgets.push(favoritesButton);
    
    // Add stop button
    const addStopButton = createWidget(widget.BUTTON, {
      ...STYLES.BUTTON,
      x: startX,
      y: px(120) + optionHeight + spacing,
      w: buttonWidth,
      h: optionHeight,
      text: "Add New Stop",
      click_func: onAddStopClick
    });
    this.settingsWidgets.push(addStopButton);
    
    // Back button
    const backButton = createWidget(widget.BUTTON, {
      ...STYLES.BUTTON,
      x: startX,
      y: px(380),
      w: buttonWidth,
      h: optionHeight,
      text: "Back to Main",
      click_func: onBackClick
    });
    this.settingsWidgets.push(backButton);
  }
  
  /* ==================== FAVORITES PAGE LAYOUT ==================== */
  
  createFavoritesPage(favorites, currentFavoritesPage, totalFavoritesPages, onPrevClick, onBackClick, onNextClick, onFavClick) {
    const titleText = createWidget(widget.TEXT, {
      ...STYLES.TITLE,
      text: "Favorite Stops"
    });
    this.favoritesWidgets.push(titleText);
    
    // Page indicator text
    if (favorites.length > 0) {
      const pageIndicator = createWidget(widget.TEXT, {
        x: px(140),
        y: px(90),
        w: px(200),
        h: px(30),
        color: 0xcccccc,
        text_size: px(24),
        align_h: align.CENTER_H,
        text: `Page ${currentFavoritesPage + 1}/${totalFavoritesPages}`
      });
      this.favoritesWidgets.push(pageIndicator);
    }
    
    // Favorites container
    const favoritesContainer = createWidget(widget.GROUP, {
      x: px(20),
      y: px(120),
      w: px(440),
      h: px(250)
    });
    this.favoritesWidgets.push(favoritesContainer);
    
    // Display favorites for current page
    this.displayFavoritesPage(favorites, currentFavoritesPage, onFavClick);
    
    // Navigation row
    const buttonWidth = px(100);
    const spacing = px(10);
    const totalWidth = 3 * buttonWidth + 2 * spacing;
    const startX = (screenWidth - totalWidth) / 2;
    
    // Previous page button
    const prevButton = createWidget(widget.BUTTON, {
      ...STYLES.BUTTON,
      x: startX,
      y: px(380),
      w: buttonWidth,
      h: px(60),
      text: "← Prev",
      normal_color: currentFavoritesPage > 0 ? 0x333333 : 0x222222,
      click_func: onPrevClick
    });
    this.favoritesWidgets.push(prevButton);
    
    // Back button
    const backButton = createWidget(widget.BUTTON, {
      ...STYLES.BUTTON,
      x: startX + buttonWidth + spacing,
      y: px(380),
      w: buttonWidth,
      h: px(60),
      text: "Back",
      click_func: onBackClick
    });
    this.favoritesWidgets.push(backButton);
    
    // Next page button
    const nextButton = createWidget(widget.BUTTON, {
      ...STYLES.BUTTON,
      x: startX + 2 * (buttonWidth + spacing),
      y: px(380),
      w: buttonWidth,
      h: px(60),
      text: "Next →",
      normal_color: currentFavoritesPage < totalFavoritesPages - 1 ? 0x333333 : 0x222222,
      click_func: onNextClick
    });
    this.favoritesWidgets.push(nextButton);
  }
  
  displayFavoritesPage(favorites, page, onFavClick) {
    if (favorites.length === 0) {
      const noFavsText = createWidget(widget.TEXT, {
        ...STYLES.MESSAGE,
        x: px(20),
        y: px(150),
        w: px(440),
        h: px(100),
        text: "No favorites saved yet.\nUse keyboard to add stops."
      });
      this.favoritesWidgets.push(noFavsText);
      return;
    }
    
    const itemsPerPage = 4;
    const startIndex = page * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, favorites.length);
    const buttonHeight = px(50);
    const spacing = px(10);
    
    for (let i = startIndex; i < endIndex; i++) {
      const fav = favorites[i];
      const index = i - startIndex;
      
      // Favorite button
      const favButton = createWidget(widget.BUTTON, {
        ...STYLES.BUTTON,
        x: px(70),
        y: px(130) + index * (buttonHeight + spacing),
        w: px(340),
        h: buttonHeight,
        text: `${fav.name || 'Stop ' + fav.code} (${fav.code})`,
        click_func: () => onFavClick(fav.code)
      });
      this.favoritesWidgets.push(favButton);
    }
  }
  
  /* ==================== UTILITY METHODS ==================== */
  
  showMessage(message, duration = 2000) {
    const msgText = createWidget(widget.TEXT, {
      x: px(40),
      y: px(220),
      w: px(400),
      h: px(60),
      color: 0xffffff,
      text_size: px(24),
      text_style: text_style.WRAP,
      align_h: align.CENTER_H,
      text: message,
      background_color: 0x000000
    });
    
    setTimeout(() => {
      hmUI.deleteWidget(msgText);
    }, duration);
  }
  
  /* ==================== CLEAR METHODS ==================== */
  
  clearScheduleWidgets() {
    this.scheduleWidgets.forEach(widget => {
      hmUI.deleteWidget(widget);
    });
    this.scheduleWidgets = [];
  }
  
  clearKeyboardWidgets() {
    this.keyboardWidgets.forEach(widget => {
      hmUI.deleteWidget(widget);
    });
    this.keyboardWidgets = [];
  }
  
  clearFavoritesWidgets() {
    this.favoritesWidgets.forEach(widget => {
      hmUI.deleteWidget(widget);
    });
    this.favoritesWidgets = [];
  }
  
  clearSettingsWidgets() {
    this.settingsWidgets.forEach(widget => {
      hmUI.deleteWidget(widget);
    });
    this.settingsWidgets = [];
  }
  
  clearMainPageWidgets() {
    this.mainPageWidgets.forEach(widget => {
      hmUI.deleteWidget(widget);
    });
    this.mainPageWidgets = [];
  }
  
  clearAllWidgets() {
    this.clearScheduleWidgets();
    this.clearKeyboardWidgets();
    this.clearFavoritesWidgets();
    this.clearSettingsWidgets();
    this.clearMainPageWidgets();
  }
}