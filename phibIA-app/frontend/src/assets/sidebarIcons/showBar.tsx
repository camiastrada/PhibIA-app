import type { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 40 40"
    {...props}
  >
    <path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M5.377 9.678h23.657M5.377 17.205h23.657M5.377 24.733h11.828M26.304 23.404l6.522 6.383-6.522 6.383"
    />
  </svg>
)
export default SvgComponent
