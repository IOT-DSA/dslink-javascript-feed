import * as DS from "dslink";
import { link } from "./link";

link.init();

link.connect().then(_ => {  
  setInterval(_ => {
    link.save();
  }, 1000 * 2.5);
});