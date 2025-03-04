import * as hmUI from "@zos/ui";
import { log as Logger } from "@zos/utils";
import { BasePage } from "@zeppos/zml/base-page";
import { createWidget, widget, align, text_style, prop } from "@zos/ui";
import { px } from "@zos/utils";

const logger = Logger.getLogger("tram_schedule");
const screenWidth = px(480);
const screenHeight = px(480);

// Page states
const PAGE_MAIN = 0;
const PAGE_KEYBOARD = 1;
const PAGE_FAVORITES = 2;
const PAGE_SETTINGS = 3;

// Default styles for reusable components
const STYLES = {
  // Title style
  TITLE: {
    x: px(20),
    y: px(40),
    w: px(440),
    h: px(50),
    color: 0xffffff,
    text_size: px(36),
    align_h: align.CENTER_H
  },
  
  // Subtitle style
  SUBTITLE: {
    x: px(20),
    y: px(90),
    w: px(440),
    h: px(40),
    color: 0xffffff,
    text_size: px(28),
    align_h: align.CENTER_H
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
    align_h: align.CENTER_H
  }
};

// UI components
let titleText;
let subtitleText;
let scheduleContainer;
let stopCodeText;
let keyboardContainer;
let favoritesContainer;
let settingsContainer;
let pageIndicator;

// Arrays to store widgets for cleanup
let scheduleWidgets = [];
let keyboardWidgets = [];
let favoritesWidgets = [];
let settingsWidgets = [];
let mainPageWidgets = [];

// Keyboard layout
const keyboardKeys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['DEL', '0', 'OK']
];

// Current state
let currentStopCode = "";
let currentPage = PAGE_MAIN;
let favorites = [];
let currentFavoritesPage = 0;
let totalFavoritesPages = 1;

Page(
  BasePage({
    state: {},
    
    onInit() {
      // Load favorites when page initializes
      this.loadFavorites();
    },
    
    build() {
      this.createMainPage();
    },
    
    // Create main page with schedule display
    createMainPage() {
      currentPage = PAGE_MAIN;
      this.clearAllWidgets();
      
      // Create title - single line now to avoid overlap
      titleText = createWidget(widget.TEXT, {
        ...STYLES.TITLE,
        text: "Torino Tram"
      });
      mainPageWidgets.push(titleText);
      
      // Display stop code in subtitle area
      subtitleText = createWidget(widget.TEXT, {
        ...STYLES.SUBTITLE, 
        text: currentStopCode ? `Stop: ${currentStopCode}` : "Schedule"
      });
      mainPageWidgets.push(subtitleText);
      
      // Schedule container
      scheduleContainer = createWidget(widget.GROUP, {
        x: px(20),
        y: px(130),
        w: px(440),
        h: px(240)
      });
      mainPageWidgets.push(scheduleContainer);
      
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
        click_func: () => {
          this.createKeyboardPage();
        }
      });
      mainPageWidgets.push(enterStopButton);
      
      const settingsButton = createWidget(widget.BUTTON, {
        ...STYLES.BUTTON,
        x: startX + buttonWidth + buttonSpacing,
        y: buttonY,
        w: buttonWidth,
        h: px(70),
        text: "Menu",
        click_func: () => {
          this.createSettingsPage();
        }
      });
      mainPageWidgets.push(settingsButton);
      
      const refreshButton = createWidget(widget.BUTTON, {
        ...STYLES.BUTTON,
        x: startX + 2 * (buttonWidth + buttonSpacing),
        y: buttonY,
        w: buttonWidth,
        h: px(70),
        text: "Refresh",
        click_func: () => {
          if (currentStopCode) {
            this.fetchTramSchedule(currentStopCode);
          } else {
            this.showMessage("Please select a stop first");
          }
        }
      });
      mainPageWidgets.push(refreshButton);
      
      // If we have a stop code, fetch data immediately
      if (currentStopCode) {
        this.fetchTramSchedule(currentStopCode);
      } else {
        this.displayNoSchedule();
      }
    },
    
    // Create new settings page that includes access to favorites
    createSettingsPage() {
      currentPage = PAGE_SETTINGS;
      this.clearAllWidgets();
      
      titleText = createWidget(widget.TEXT, {
        ...STYLES.TITLE,
        text: "Settings"
      });
      settingsWidgets.push(titleText);
      
      // Settings container
      settingsContainer = createWidget(widget.GROUP, {
        x: px(20),
        y: px(100),
        w: px(440),
        h: px(300)
      });
      settingsWidgets.push(settingsContainer);
      
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
        click_func: () => {
          this.createFavoritesPage();
        }
      });
      settingsWidgets.push(favoritesButton);
      
      // Add stop button
      const addStopButton = createWidget(widget.BUTTON, {
        ...STYLES.BUTTON,
        x: startX,
        y: px(120) + optionHeight + spacing,
        w: buttonWidth,
        h: optionHeight,
        text: "Add New Stop",
        click_func: () => {
          this.createKeyboardPage();
        }
      });
      settingsWidgets.push(addStopButton);
      
      // Back button
      const backButton = createWidget(widget.BUTTON, {
        ...STYLES.BUTTON,
        x: startX,
        y: px(380),
        w: buttonWidth,
        h: optionHeight,
        text: "Back to Main",
        click_func: () => {
          this.createMainPage();
        }
      });
      settingsWidgets.push(backButton);
    },
    
    // Create keyboard page
    createKeyboardPage() {
      currentPage = PAGE_KEYBOARD;
      this.clearAllWidgets();
      
      // Reset current stop code when accessing keyboard directly
      // Keep the current code if we're editing an existing one
      if (currentPage !== PAGE_MAIN || !currentStopCode) {
        currentStopCode = "";
      }
      
      titleText = createWidget(widget.TEXT, {
        ...STYLES.TITLE,
        text: "Enter Stop Code"
      });
      keyboardWidgets.push(titleText);
      
      stopCodeText = createWidget(widget.TEXT, {
        ...STYLES.SUBTITLE,
        y: px(100),
        text: currentStopCode
      });
      keyboardWidgets.push(stopCodeText);
      
      // Keyboard container
      keyboardContainer = createWidget(widget.GROUP, {
        x: px(40),
        y: px(160),
        w: px(400),
        h: px(240)
      });
      keyboardWidgets.push(keyboardContainer);
      
      // Generate keyboard
      this.createKeyboard();
      
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
        click_func: () => {
          this.createMainPage();
        }
      });
      keyboardWidgets.push(backButton);
      
      // Save button
      const saveButton = createWidget(widget.BUTTON, {
        ...STYLES.BUTTON,
        x: startX + buttonWidth + spacing,
        y: px(400),
        w: buttonWidth,
        h: px(60),
        text: "Save as Favorite",
        click_func: () => {
          if (currentStopCode && currentStopCode.length > 0) {
            this.saveFavoriteStop(currentStopCode);
          } else {
            this.showMessage("Please enter a stop code first");
          }
        }
      });
      keyboardWidgets.push(saveButton);
    },
    
    // Create keyboard buttons
    createKeyboard() {
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
            click_func: () => {
              this.handleKeyPress(key);
            }
          });
          keyboardWidgets.push(keyButton);
        }
      }
    },
    
    // Handle keyboard key press
    handleKeyPress(key) {
      if (key === 'DEL') {
        currentStopCode = currentStopCode.slice(0, -1);
      } else if (key === 'OK') {
        if (currentStopCode && currentStopCode.length > 0) {
          this.fetchTramSchedule(currentStopCode);
          this.createMainPage();
        } else {
          this.showMessage("Please enter a stop code");
        }
      } else {
        if (currentStopCode.length < 5) { // Limit code length
          currentStopCode += key;
        }
      }
      
      stopCodeText.setProperty(prop.TEXT, currentStopCode);
    },
    
    // Create favorites page with pagination
    createFavoritesPage() {
      currentPage = PAGE_FAVORITES;
      this.clearAllWidgets();
      
      // Calculate total pages needed for favorites
      const itemsPerPage = 4;
      totalFavoritesPages = Math.max(1, Math.ceil(favorites.length / itemsPerPage));
      
      titleText = createWidget(widget.TEXT, {
        ...STYLES.TITLE,
        text: "Favorite Stops"
      });
      favoritesWidgets.push(titleText);
      
      // Page indicator text
      if (favorites.length > 0) {
        pageIndicator = createWidget(widget.TEXT, {
          x: px(140),
          y: px(90),
          w: px(200),
          h: px(30),
          color: 0xcccccc,
          text_size: px(24),
          align_h: align.CENTER_H,
          text: `Page ${currentFavoritesPage + 1}/${totalFavoritesPages}`
        });
        favoritesWidgets.push(pageIndicator);
      }
      
      // Favorites container
      favoritesContainer = createWidget(widget.GROUP, {
        x: px(20),
        y: px(120),
        w: px(440),
        h: px(250)
      });
      favoritesWidgets.push(favoritesContainer);
      
      // Display favorites for current page
      this.displayFavoritesPage(currentFavoritesPage);
      
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
        click_func: () => {
          if (currentFavoritesPage > 0) {
            currentFavoritesPage--;
            this.createFavoritesPage();
          }
        }
      });
      favoritesWidgets.push(prevButton);
      
      // Back button
      const backButton = createWidget(widget.BUTTON, {
        ...STYLES.BUTTON,
        x: startX + buttonWidth + spacing,
        y: px(380),
        w: buttonWidth,
        h: px(60),
        text: "Back",
        click_func: () => {
          this.createSettingsPage();
        }
      });
      favoritesWidgets.push(backButton);
      
      // Next page button
      const nextButton = createWidget(widget.BUTTON, {
        ...STYLES.BUTTON,
        x: startX + 2 * (buttonWidth + spacing),
        y: px(380),
        w: buttonWidth,
        h: px(60),
        text: "Next →",
        normal_color: currentFavoritesPage < totalFavoritesPages - 1 ? 0x333333 : 0x222222,
        click_func: () => {
          if (currentFavoritesPage < totalFavoritesPages - 1) {
            currentFavoritesPage++;
            this.createFavoritesPage();
          }
        }
      });
      favoritesWidgets.push(nextButton);
    },
    
    // Display favorites with pagination
    displayFavoritesPage(page) {
      if (favorites.length === 0) {
        const noFavsText = createWidget(widget.TEXT, {
          ...STYLES.MESSAGE,
          x: px(20),
          y: px(150),
          w: px(440),
          h: px(100),
          text: "No favorites saved yet.\nUse keyboard to add stops."
        });
        favoritesWidgets.push(noFavsText);
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
          click_func: () => {
            currentStopCode = fav.code;
            this.fetchTramSchedule(fav.code);
            this.createMainPage();
          }
        });
        favoritesWidgets.push(favButton);
      }
    },
    
    // Fetch tram schedule from the API
    fetchTramSchedule(stopCode) {
      this.clearScheduleWidgets();
      
      // Show loading message
      const loadingText = createWidget(widget.TEXT, {
        ...STYLES.MESSAGE,
        x: px(20),
        y: px(150),
        w: px(440),
        h: px(100),
        text: "Loading tram schedule..."
      });
      scheduleWidgets.push(loadingText);
      
      // Make request to the app-side
      this.request({
        method: "GET_TRAM_SCHEDULE",
        params: {
          stopCode: stopCode
        }
      })
      .then((data) => {
        logger.log("Received tram data:", data);
        this.clearScheduleWidgets();
        
        const { result, stopCode } = data;
        
        if (result === "ERROR" || !Array.isArray(result) || result.length === 0) {
          this.displayNoSchedule();
          return;
        }
        
        // Display the tram schedule
        this.displaySchedule(result);
      })
      .catch((error) => {
        logger.log("Error fetching tram data:", error);
        this.clearScheduleWidgets();
        this.displayNoSchedule("Error fetching data");
      });
    },
    
    // Display the tram schedule
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
          text: `L ${item.line}`
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
        
        scheduleWidgets.push(lineText, timeText, rtText);
      }
    },
    
    // Display message when no schedule is available
    displayNoSchedule(message = "No trams scheduled") {
      const noDataText = createWidget(widget.TEXT, {
        ...STYLES.MESSAGE,
        x: px(20),
        y: px(150),
        w: px(440),
        h: px(100),
        text: message
      });
      scheduleWidgets.push(noDataText);
    },
    
    // Show a temporary message
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
    },
     
    // Save a stop to favorites
    saveFavoriteStop(stopCode) {
      this.request({
        method: "SAVE_FAVORITE_STOP",
        params: {
          stopCode: stopCode,
          stopName: `Stop ${stopCode}`
        }
      })
      .then((data) => {
        logger.log("Save favorite response:", data);
        if (data.result === "SUCCESS") {
          favorites = data.favorites;
          this.showMessage(`Stop ${stopCode} saved to favorites`);
        } else {
          this.showMessage("Failed to save favorite");
        }
      })
      .catch((error) => {
        logger.log("Error saving favorite:", error);
        this.showMessage("Error saving favorite");
      });
    },
    
    // Load favorites from storage
    loadFavorites() {
      this.request({
        method: "GET_FAVORITE_STOPS"
      })
      .then((data) => {
        logger.log("Load favorites response:", data);
        if (data.result === "SUCCESS") {
          favorites = data.favorites;
        }
      })
      .catch((error) => {
        logger.log("Error loading favorites:", error);
      });
    },
    
    // Clean up widgets
    clearScheduleWidgets() {
      scheduleWidgets.forEach(widget => {
        hmUI.deleteWidget(widget);
      });
      scheduleWidgets = [];
    },
    
    clearKeyboardWidgets() {
      keyboardWidgets.forEach(widget => {
        hmUI.deleteWidget(widget);
      });
      keyboardWidgets = [];
    },
    
    clearFavoritesWidgets() {
      favoritesWidgets.forEach(widget => {
        hmUI.deleteWidget(widget);
      });
      favoritesWidgets = [];
    },
    
    clearSettingsWidgets() {
      settingsWidgets.forEach(widget => {
        hmUI.deleteWidget(widget);
      });
      settingsWidgets = [];
    },
    
    clearMainPageWidgets() {
      mainPageWidgets.forEach(widget => {
        hmUI.deleteWidget(widget);
      });
      mainPageWidgets = [];
    },
    
    clearAllWidgets() {
      this.clearScheduleWidgets();
      this.clearKeyboardWidgets();
      this.clearFavoritesWidgets();
      this.clearSettingsWidgets();
      this.clearMainPageWidgets();
    },
    
    onDestroy() {
      this.clearAllWidgets();
    }
  })
);