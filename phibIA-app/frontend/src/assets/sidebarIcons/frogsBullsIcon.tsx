import type { ImgHTMLAttributes } from "react";
import miImagen from "../frog2.webp";

const MiIcono = (props: ImgHTMLAttributes<HTMLImageElement>) => (
  <img src={miImagen} alt="Mi ícono" className="size-6" {...props} />
);

export default MiIcono;
