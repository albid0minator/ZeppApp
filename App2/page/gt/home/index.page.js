import * as hmUI from "@zos/ui";
import { log as Logger } from "@zos/utils";
import { TEXT_STYLE } from "zosLoader:./index.page.[pf].layout.js";
import { Storage } from "@silver-zepp/easy-storage";
import { LocalStorage } from '@zos/storage'
import { openSync, readSync, O_RDONLY } from '@zos/fs'
import { openAssetsSync } from '@zos/fs'
import {  readFileSync} from '@zos/fs'


const logger = Logger.getLogger("helloworld");
Page({
  onInit() {
    logger.debug("page onInit invoked");
   // const contents = Storage.ListDirectory('assets');
   // console.log(contents); // Outputs: ['file1.txt', 'file2.txt', 'subdirectory']
   // const contenuto = Storage.ReadFile('raw/n1.txt');
   // const contenuto2 = Storage.ReadAsset('raw/n1.txt');
   // console.log("Contenuto del file:", contenuto);


  /*const file = hmFS.open_asset(`raw/n1.txt`, hmFS.O_RDONLY)
  const [fs_stat, err] = hmFS.stat_asset(`raw/n1`)
  if (err !== 0) {
    logger.debug('Error reading file stats:', err)
    return
  } const fileSize = fs_stat.size
  const buffer = new Uint16Array(fileSize / 2)
  */
   
  /*
  const fd = openAssetsSync({
  path: 'n1.txt',
  flag: O_RDONLY,
  })
  console.log(fd) 
  const buffer = new ArrayBuffer(4)
  const result = readSync({
  fd,
  buffer,
  })
  console.log('ecco il risultato'+ result)
  */
  const currentFile = readFileSync('current_file')
  const test_buf = new Uint8Array(10)
const test_buf2 = new Uint8Array(test_buf.length)

const file = hmFS.open('n1.txt', hmFS.O_RDWR | hmFS.O_CREAT)
hmFS.read(file, test_buf2.buffer, 0, test_buf2.length)
    
    const fullText = String.fromCharCode.apply(null, test_buf2)
    console.log(fullText)

 
  },
  build() {
    logger.debug("page build invoked");
    hmUI.createWidget(hmUI.widget.TEXT, TEXT_STYLE);
  },
  onDestroy() {
    logger.debug("page onDestroy invoked");
  },
});
