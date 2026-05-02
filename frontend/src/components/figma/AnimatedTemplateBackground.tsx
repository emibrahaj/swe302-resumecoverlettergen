import backgroundImage from "../../../public/photo-collage.jpg";

export function AnimatedTemplateBackground() {
  return (
    <>
      <style>{`
        @keyframes scroll-vertical {
          0% {
            transform: translateY(0%);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        .animate-scroll {
          animation: scroll-vertical 60s linear infinite alternate;
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div
          className="animate-scroll"
          style={{ height: "200%" }}
        >
          <img
            src={backgroundImage.src}
            alt="CV Templates"
            className="w-full h-1/2 object-cover"
            style={{ transform: "scale(1.5)", transformOrigin: "center" }}
          />
          <img
            src={backgroundImage.src}
            alt="CV Templates"
            className="w-full h-1/2 object-cover"
            style={{ transform: "scale(1.5)", transformOrigin: "center" }}
          />
        </div>
      </div>
    </>
  );
}