import * as hmUI from "@zos/ui";
import { log as Logger } from "@zos/utils";
import { BasePage } from "@zeppos/zml/base-page";
import { PAGE_MAIN, PAGE_KEYBOARD, PAGE_FAVORITES, PAGE_SETTINGS } from "./utils/config/styles";
import { TramUILayouts } from "./utils/config/layouts";

const logger = Logger.getLogger("tram_schedule");

Page(
  BasePage({
    state: {},
    
    // Current state
    currentStopCode: "",
    currentPage: PAGE_MAIN,
    favorites: [],
    currentFavoritesPage: 0,
    totalFavoritesPages: 1,
    
    // UI layouts manager
    ui: null,
    
    onInit() {
      // Initialize UI layouts
      this.ui = new TramUILayouts(this);
      
      // Load favorites when page initializes
      this.loadFavorites();
    },
    
    build() {
      this.createMainPage();
    },
    
    // Create main page with schedule display
    createMainPage() {
      this.currentPage = PAGE_MAIN;
      this.ui.clearAllWidgets();
      
      this.ui.createMainPage(
        this.currentStopCode,
        () => this.createKeyboardPage(),
        () => this.createSettingsPage(),
        () => {
          if (this.currentStopCode) {
            this.fetchTramSchedule(this.currentStopCode);
          } else {
            this.ui.showMessage("Please select a stop first");
          }
        }
      );
      
      // If we have a stop code, fetch data immediately
      if (this.currentStopCode) {
        this.fetchTramSchedule(this.currentStopCode);
      } else {
        this.ui.displayNoSchedule();
      }
    },
    
    // Create new settings page
    createSettingsPage() {
      this.currentPage = PAGE_SETTINGS;
      this.ui.clearAllWidgets();
      
      this.ui.createSettingsPage(
        () => this.createFavoritesPage(),
        () => this.createKeyboardPage(),
        () => this.createMainPage()
      );
    },
    
    // Create keyboard page
    createKeyboardPage() {
      this.currentPage = PAGE_KEYBOARD;
      this.ui.clearAllWidgets();
      
      // Reset current stop code when accessing keyboard directly
      if (this.currentPage !== PAGE_MAIN || !this.currentStopCode) {
        this.currentStopCode = "";
      }
      
      const { stopCodeText } = this.ui.createKeyboardPage(
        this.currentStopCode,
        (key) => this.handleKeyPress(key, stopCodeText),
        () => this.createMainPage(),
        () => {
          if (this.currentStopCode && this.currentStopCode.length > 0) {
            this.saveFavoriteStop(this.currentStopCode);
          } else {
            this.ui.showMessage("Please enter a stop code first");
          }
        }
      );
      
      this.stopCodeText = stopCodeText;
    },
    
    // Handle keyboard key press
    handleKeyPress(key, stopCodeText) {
      if (key === 'DEL') {
        this.currentStopCode = this.currentStopCode.slice(0, -1);
      } else if (key === 'OK') {
        if (this.currentStopCode && this.currentStopCode.length > 0) {
          this.fetchTramSchedule(this.currentStopCode);
          this.createMainPage();
        } else {
          this.ui.showMessage("Please enter a stop code");
        }
      } else {
        if (this.currentStopCode.length < 5) { // Limit code length
          this.currentStopCode += key;
        }
      }
      
      stopCodeText.setProperty(prop.TEXT, this.currentStopCode);
    },
    
    // Create favorites page with pagination
    createFavoritesPage() {
      this.currentPage = PAGE_FAVORITES;
      this.ui.clearAllWidgets();
      
      // Calculate total pages needed for favorites
      const itemsPerPage = 4;
      this.totalFavoritesPages = Math.max(1, Math.ceil(this.favorites.length / itemsPerPage));
      
      this.ui.createFavoritesPage(
        this.favorites,
        this.currentFavoritesPage,
        this.totalFavoritesPages,
        // Previous page
        () => {
          if (this.currentFavoritesPage > 0) {
            this.currentFavoritesPage--;
            this.createFavoritesPage();
          }
        },
        // Back
        () => this.createSettingsPage(),
        // Next page
        () => {
          if (this.currentFavoritesPage < this.totalFavoritesPages - 1) {
            this.currentFavoritesPage++;
            this.createFavoritesPage();
          }
        },
        // Favorite click
        (code) => {
          this.currentStopCode = code;
          this.fetchTramSchedule(code);
          this.createMainPage();
        }
      );
    },
    
    // Fetch tram schedule from the API
    fetchTramSchedule(stopCode) {
      this.ui.clearScheduleWidgets();
      
      // Show loading message
      this.ui.displayNoSchedule("Loading tram schedule...");
      
      // Make request to the app-side
      this.request({
        method: "GET_TRAM_SCHEDULE",
        params: {
          stopCode: stopCode
        }
      })
      .then((data) => {
        logger.log("Received tram data:", data);
        this.ui.clearScheduleWidgets();
        
        const { result, stopCode } = data;
        
        if (result === "ERROR" || !Array.isArray(result) || result.length === 0) {
          this.ui.displayNoSchedule();
          return;
        }
        
        // Display the tram schedule
        this.ui.displaySchedule(result);
      })
      .catch((error) => {
        logger.log("Error fetching tram data:", error);
        this.ui.clearScheduleWidgets();
        this.ui.displayNoSchedule("Error fetching data");
      });
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
          this.favorites = data.favorites;
          this.ui.showMessage(`Stop ${stopCode} saved to favorites`);
        } else {
          this.ui.showMessage("Failed to save favorite");
        }
      })
      .catch((error) => {
        logger.log("Error saving favorite:", error);
        this.ui.showMessage("Error saving favorite");
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
          this.favorites = data.favorites;
        }
      })
      .catch((error) => {
        logger.log("Error loading favorites:", error);
      });
    },
    
    onDestroy() {
      this.ui.clearAllWidgets();
    }
  })
);