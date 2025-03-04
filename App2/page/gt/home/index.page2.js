import * as hmUI from "@zos/ui";
import { log as Logger } from "@zos/utils";
import { TEXT_STYLE } from "zosLoader:./index.page.[pf].layout.js";
import { readFile, listDir } from "@zos/fs";

const logger = Logger.getLogger("test-file-access");

Page({
  onInit() {
    logger.debug("page onInit invoked");
    
    // Crea un widget di testo per mostrare l'output
    this.textWidget = hmUI.createWidget(hmUI.widget.TEXT, {
      x: 10,
      y: 100,
      w: 446,
      h: 300,
      color: 0xffffff,
      text_size: 18,
      text: "Caricamento..."
    });
    
    // Controlla quali file sono disponibili
    this.testFileAccess();
  },
  
  testFileAccess() {
    let output = "";
    
    // Elenca i file nella directory assets
    try {
      const files = listDir({
        path: "assets"
      });
      output += "File in assets:\n" + files.join("\n") + "\n\n";
    } catch (error) {
      output += "Errore elencando assets: " + JSON.stringify(error) + "\n\n";
    }
    
    // Elenca i file nella directory assets/raw
    try {
      const files = listDir({ 
        path: "assets://"
      });
      output += "File in assets/raw:\n" + files.join("\n") + "\n\n";
    } catch (error) {
      output += "Errore elencando assets/raw: " + JSON.stringify(error) + "\n\n";
    }
    
    // Prova a leggere uno specifico file
    try {
      readFile({
        path: "assets://images/n1.txt",  // Modifica il percorso per il tuo file specifico
        encoding: 'utf8',
        success: (data) => {
          output += "Contenuto del file:\n" + (data.substring(0, 100) + "...");
          this.updateOutput(output);
        },
        fail: (error) => {
          output += "Errore leggendo il file: " + JSON.stringify(error);
          this.updateOutput(output);
        }
      });
    } catch (error) {
      output += "Eccezione leggendo il file: " + JSON.stringify(error);
      this.updateOutput(output);
    }
  },
  
  updateOutput(text) {
    if (this.textWidget) {
      this.textWidget.setProperty(hmUI.prop.TEXT, text);
    }
  },
  
  build() {
    logger.debug("page build invoked");
  },
  
  onDestroy() {
    logger.debug("page onDestroy invoked");
  }
});