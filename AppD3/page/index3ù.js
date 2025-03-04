import hmUI from "@zos/ui";
import { log as Logger } from "@zos/utils";
import { getText } from "@zos/i18n";
import { BasePage } from '@zeppos/zml/base-page';
import * as Styles from "zosLoader:./index.[pf].layout.js";
import { createPressedBtn } from "../components/pressed-btn";
import { getResourcePath } from "./../utils/index";
import { readFileSync, statSync, exists } from "@zos/fs";

const logger = Logger.getLogger("download page");

let textWidget;
let imageWidget;

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
        return exists(path);
      } catch (error) {
        logger.error("Error checking file existence: %j", error);
        return false;
      }
    },
    
    // Mostra l'immagine sullo schermo
    displayImage(imageName = DEFAULT_IMAGE_NAME) {
      const imagePath = getResourcePath(imageName);
      
      // Rimuovi l'immagine precedente se esiste
      if (imageWidget) {
        hmUI.deleteWidget(imageWidget);
      }
      
      // Reposiziona il testo più in alto per evitare sovrapposizioni
      textWidget.setProperty(hmUI.prop.Y, Styles.TIPS_STYLE.y - 40);
      
      // Crea il widget immagine sotto il testo
      imageWidget = hmUI.createWidget(hmUI.widget.IMG, {
        ...Styles.COVER_IMG,
        y: Styles.TIPS_STYLE.y + 80, // Posiziona l'immagine sotto il testo
        src: imagePath
      });
      
      // Aggiorna il messaggio
      textWidget.setProperty(
        hmUI.prop.TEXT, 
        "Image loaded successfully"
      );
      
      this.state.fileName = imageName;
    },
    
    // Gestisce la logica di download o display diretto
    handleDownload() {
      // Verifica se l'immagine esiste già prima di scaricarla
      if (this.checkImageExists()) {
        logger.debug("Image already exists, displaying directly");
        textWidget.setProperty(hmUI.prop.TEXT, "Image found in memory");
        this.displayImage();
        return true;
      }
      
      // Se non esiste, procedi con il download
      return false;
    },
    
    onCall({ result }) {
      if (result && "filePath" in result) {
        this.state.filePath = result.filePath;
        this.state.isDownload = false;
        
        if (this.checkImageExists()) {
          // Se l'immagine esiste già, mostrala direttamente
          this.state.imageExists = true;
          textWidget.setProperty(hmUI.prop.TEXT, "Image already exists");
          this.displayImage();
        } else {
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
        logger.debug("file progress === ==>", numProgress);
        if (numProgress === 100) {
          this.state.isTransfer = false;
          this.state.fileName = fileHandler.fileName || DEFAULT_IMAGE_NAME;
          this.displayImage(this.state.fileName);
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
          this.displayImage(this.state.fileName);
        }
      });
    },
    
    build() {
      textWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...Styles.TIPS_STYLE,
        text: getText("downloadTip"),
      });

      // Preparazione per il widget immagine (placeholder vuoto)
      imageWidget = null;
      
      // Controlla immediatamente se l'immagine esiste già all'avvio
      if (this.checkImageExists()) {
        textWidget.setProperty(hmUI.prop.TEXT, "Image found. Press Download to view.");
        this.state.imageExists = true;
      }

      createPressedBtn(
        Styles.DOWNLOAD_BTN,
        () => {
          logger.debug("--->click download");
          
          // Se l'immagine esiste già, mostrala direttamente
          if (this.handleDownload()) {
            return;
          }
          
          if (this.state.isDownload) return;
          
          this.state.isDownload = true;
          textWidget.setProperty(hmUI.prop.TEXT, getText("downloadingTip"));

          this.request({
            method: "img.cover",
            params: "",
          })
            .then((result) => {})
            .catch((error) => {
              logger.error("error=>%j", error);
              this.state.isDownload = false;
              textWidget.setProperty(
                hmUI.prop.TEXT,
                getText("downloadFailTip")
              );
            });
        },
        hmUI
      );

      createPressedBtn(
        Styles.TRANS_BTN,
        () => {
          logger.debug("--->click transfer");
          
          // Se il pulsante trasferimento viene premuto ma l'immagine esiste già, mostrala direttamente
          if (this.state.imageExists) {
            this.displayImage();
            return;
          }
          
          if (this.state.isTransfer) return;
          if (!this.state.filePath) return;
          if (this.state.fileName) return;
          
          this.state.isTransfer = true;
          textWidget.setProperty(hmUI.prop.TEXT, getText("transingTip"));

          this.request({
            method: "img.trans",
            params: {
              filePath: this.state.filePath,
            },
          })
            .then((result) => {})
            .catch((error) => {
              logger.error("error=>%j", error);
              this.state.isTransfer = false;
              textWidget.setProperty(hmUI.prop.TEXT, getText("transFailTip"));
            });
        },
        hmUI
      );
    },
  })
);