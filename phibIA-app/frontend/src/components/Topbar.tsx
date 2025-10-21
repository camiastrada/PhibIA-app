import { useLocation } from "react-router-dom";

const paths: Record<string, string> = {
    home: "Inicio",
}
export default function Topbar(){
    const {pathname} = useLocation(); 
    const page = pathname.split("/")[1];
    return(
        <div className="fixed h-12 w-full bg-[#152C28]/70 text-white flex flex-row top-0 shadow-lg z-10 items-center justify-between md:hidden">
            <div id="profileSection" className="rounded-full flex items-center justify-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </div>
            <div className="absolute inset-x-0 flex items-center justify-center">
                <p className="text-xl">
                    {page === "" ? "Inicio" : paths[page] ?? "pagina descocnocida"}
                </p>
            </div>
        </div>
    )
}