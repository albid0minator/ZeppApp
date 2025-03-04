import hmUI from "@zos/ui";
import { log as Logger } from "@zos/utils";
import { getText } from "@zos/i18n";
import { BasePage } from '@zeppos/zml/base-page';
import * as Styles from "zosLoader:./index.[pf].layout.js";
import { createPressedBtn } from "../components/pressed-btn";
import { getResourcePath } from "./../utils/index";
import { exists } from "@zos/fs";

const logger = Logger.getLogger("download page");

let textWidget;
let statusWidget; // Widget aggiuntivo per mostrare lo stato dell'operazione

// Nome immagine fisso per semplificare la logica di verifica
const DEFAULT_IMAGE_NAME = "cover_image.jpg";

Page(
  BasePage({ 
    state: {
      isDownload: false,
      isTransfer: false,
      filePath: "",
      fileName: "",
      imageExists: false
    },
    
    // Controlla se l'immagine esiste già in memoria
    checkImageExists(imageName = DEFAULT_IMAGE_NAME) {
      try {
        const path = getResourcePath(imageName);
        const imageExists = exists(path);
        logger.debug("Image check: " + (imageExists ? "Found" : "Not found") + " at " + path);
        return imageExists;
      } catch (error) {
        logger.error("Error checking file existence: %j", error);
        return false;
      }
    },
    
    // Aggiorna i messaggi di stato senza mostrare l'immagine
    updateStatus(message) {
      statusWidget.setProperty(hmUI.prop.TEXT, message);
      logger.debug("Status updated: " + message);
    },
    
    // Gestisce la logica di download o display diretto
    handleDownload() {
      // Verifica se l'immagine esiste già prima di scaricarla
      if (this.checkImageExists()) {
        logger.debug("Image already exists, no need to download");
        this.updateStatus("✓ Image found in memory");
        this.state.fileName = DEFAULT_IMAGE_NAME;
        this.state.imageExists = true;
        return true;
      }
      
      // Se non esiste, procedi con il download
      this.updateStatus("⚠ Image not found, need to download");
      return false;
    },
    
    onCall({ result }) {
      if (result && "filePath" in result) {
        this.state.filePath = result.filePath;
        this.state.isDownload = false;
        
        logger.debug("Got file path: " + result.filePath);
        
        if (this.checkImageExists()) {
          // Se l'immagine esiste già, aggiorna lo stato
          this.state.imageExists = true;
          this.updateStatus("✓ Image already exists");
          textWidget.setProperty(hmUI.prop.TEXT, "Press any button to test");
        } else {
          this.updateStatus("⚠ Need to transfer image");
          textWidget.setProperty(hmUI.prop.TEXT, getText("transTip"));
        }
      }
    },
    
    onReceivedFile(fileHandler) {
      logger.debug("file received %s", fileHandler.toString());

      fileHandler.on("progress", (progress) => {
        const { loadedSize: loaded, fileSize: total } = progress.data;
        const numProgress =
          loaded === total ? 100 : Math.floor((loaded * 100) / total);
        
        this.updateStatus("Transferring: " + numProgress + "%");
        
        if (numProgress === 100) {
          this.state.isTransfer = false;
          this.state.fileName = fileHandler.fileName || DEFAULT_IMAGE_NAME;
          this.updateStatus("✓ Transfer completed: " + this.state.fileName);
        }
      });

      fileHandler.on("change", (event) => {
        logger.debug("file status === ==>", event.data.readyState);
        if (event.data.readyState === "transferred") {
          logger.debug(
            "COVER file transfer success ===> ",
            fileHandler.filePath
          );
          this.state.isTransfer = false;
          this.state.fileName = fileHandler.fileName || DEFAULT_IMAGE_NAME;
          this.updateStatus("✓ File ready: " + this.state.fileName);
        }
      });
    },
    
    build() {
      // Widget principale per istruzioni
      textWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...Styles.TIPS_STYLE,
        text: getText("downloadTip"),
      });

      // Widget aggiuntivo per mostrare lo stato delle operazioni
      statusWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        x: Styles.TIPS_STYLE.x,
        y: Styles.TIPS_STYLE.y + 100, // Posiziona sotto il testo principale
        w: Styles.TIPS_STYLE.w,
        h: px(80),
        color: 0xffff00, // Giallo per distinguerlo
        text_size: px(30),
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
        text_style: hmUI.text_style.WRAP,
        text: "Ready to test image operations",
      });
      
      // Controlla immediatamente se l'immagine esiste già all'avvio
      if (this.checkImageExists()) {
        textWidget.setProperty(hmUI.prop.TEXT, "Image found, press buttons to test");
        this.updateStatus("✓ Image already exists in memory");
        this.state.imageExists = true;
      } else {
        this.updateStatus("⚠ No image found in memory");
      }

      createPressedBtn(
        Styles.DOWNLOAD_BTN,
        () => {
          logger.debug("--->click download");
          
          // Se l'immagine esiste già, mostra solo un messaggio
          if (this.handleDownload()) {
            textWidget.setProperty(hmUI.prop.TEXT, "Image exists, no download needed");
            return;
          }
          
          if (this.state.isDownload) return;
          
          this.state.isDownload = true;
          textWidget.setProperty(hmUI.prop.TEXT, getText("downloadingTip"));
          this.updateStatus("Downloading image...");

          this.request({
            method: "img.cover",
            params: "",
          }) 
            .then((result) => {
              logger.debug("Download request completed");
            })
            .catch((error) => {
              logger.error("error=>%j", error);
              this.state.isDownload = false;
              textWidget.setProperty(
                hmUI.prop.TEXT,
                getText("downloadFailTip")
              );
              this.updateStatus("❌ Download failed");
            });
        },
        hmUI
      );

      createPressedBtn(
        Styles.TRANS_BTN,
        () => {
          logger.debug("--->click transfer");
          
          // Se il pulsante trasferimento viene premuto ma l'immagine esiste già, mostra solo un messaggio
          if (this.state.imageExists) {
            textWidget.setProperty(hmUI.prop.TEXT, "Image exists, no transfer needed");
            this.updateStatus("✓ Using existing image");
            return;
          }
          
          if (this.state.isTransfer) return;
          if (!this.state.filePath) {
            this.updateStatus("❌ No file path, download first");
            return;
          }
          if (this.state.fileName) {
            this.updateStatus("✓ File already transferred");
            return;
          }
          
          this.state.isTransfer = true;
          textWidget.setProperty(hmUI.prop.TEXT, getText("transingTip"));
          this.updateStatus("Starting transfer process...");

          this.request({
            method: "img.trans",
            params: {
              filePath: this.state.filePath,
            },
          })
            .then((result) => {
              logger.debug("Transfer request completed");
            })
            .catch((error) => {
              logger.error("error=>%j", error);
              this.state.isTransfer = false;
              textWidget.setProperty(hmUI.prop.TEXT, getText("transFailTip"));
              this.updateStatus("❌ Transfer failed");
            });
        },
        hmUI
      );
    },
  })
);