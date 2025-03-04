import { BaseSideService } from "@zeppos/zml/base-side";

// Function to fetch tram schedule data
async function fetchTramSchedule(stopCode, res) {
  try {
    // Request tram data from the GTT Pirate API
    const response = await fetch({
      url: `http://gpa.madbob.org/query.php?stop=${stopCode}`,
      method: 'GET'
    });
    
    const resBody = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
    
    res(null, {
      result: resBody,
      stopCode: stopCode
    });
  } catch (error) {
    console.log("Fetch error:", error);
    res(null, {
      result: "ERROR",
      error: error.message
    });
  }
}

// Function to save a favorite stop
function saveFavoriteStop(stopCode, stopName, res) {
  try {
    // We'll use the app's settings storage to save favorite stops
    const settingsStorage = getApp()._settings;
    let favorites = settingsStorage.getItem('favorites');
    
    // Parse existing favorites or create a new array
    if (!favorites) {
      favorites = [];
    } else {
      favorites = JSON.parse(favorites);
    }
    
    // Add new favorite if it doesn't exist
    const existingIndex = favorites.findIndex(fav => fav.code === stopCode);
    if (existingIndex === -1) {
      favorites.push({
        code: stopCode,
        name: stopName || `Stop ${stopCode}`
      });
    } else {
      // Update existing favorite
      favorites[existingIndex].name = stopName || favorites[existingIndex].name;
    }
    
    // Save updated favorites
    settingsStorage.setItem('favorites', JSON.stringify(favorites));
    
    res(null, {
      result: "SUCCESS",
      favorites: favorites
    });
  } catch (error) {
    console.log("Save error:", error);
    res(null, {
      result: "ERROR",
      error: error.message
    });
  }
}

// Function to get favorite stops
function getFavoriteStops(res) {
  try {
    const settingsStorage = getApp()._settings;
    let favorites = settingsStorage.getItem('favorites');
    
    // Parse existing favorites or return empty array
    if (!favorites) {
      favorites = [];
    } else {
      favorites = JSON.parse(favorites);
    }
    
    res(null, {
      result: "SUCCESS",
      favorites: favorites
    });
  } catch (error) {
    console.log("Get favorites error:", error);
    res(null, {
      result: "ERROR",
      error: error.message
    });
  }
}

AppSideService(
  BaseSideService({
    onInit() {
      console.log("Tram Schedule App-Side initialized");
    },

    onRequest(req, res) {
      console.log("App-Side request:", req.method);
      
      switch (req.method) {
        case "GET_TRAM_SCHEDULE":
          if (req.params && req.params.stopCode) {
            fetchTramSchedule(req.params.stopCode, res);
          } else {
            res(null, { result: "ERROR", error: "Stop code is required" });
          }
          break;
          
        case "SAVE_FAVORITE_STOP":
          if (req.params && req.params.stopCode) {
            saveFavoriteStop(req.params.stopCode, req.params.stopName, res);
          } else {
            res(null, { result: "ERROR", error: "Stop code is required" });
          }
          break;
          
        case "GET_FAVORITE_STOPS":
          getFavoriteStops(res);
          break;
          
        default:
          res(null, { result: "ERROR", error: "Unknown method" });
      }
    },

    onRun() {},

    onDestroy() {},
  })
);