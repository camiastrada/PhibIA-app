interface Text{
    title?: string; 
    subtitle?: string; 
}
export default function TitleWithSubtitle({title, subtitle} : Text){
    return(
        <>
        <h1 className="text-2xl md:text-5xl font-bold mb-6 text-[#43A047]">
            {title}
        </h1>
        <p className="text-md md:text-xl mb-4 text-center px-10 font-normal font-sans">
            {subtitle}
        </p>
        </>
    )
}