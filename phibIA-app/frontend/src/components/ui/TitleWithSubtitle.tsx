interface Text{
    title?: string; 
    titleColor?: string; 
    subtitle?: string; 
}
export default function TitleWithSubtitle({title, subtitle, titleColor} : Text){
    return(
        <>
        <h1 className="text-2xl md:text-5xl font-bold text-[#43A047]"
            style={{color: titleColor}}>
            {title}
        </h1>
        <p className="text-md md:text-xl my-4 text-center px-10 font-normal font-sans">
            {subtitle}
        </p>
        </>
    )
}