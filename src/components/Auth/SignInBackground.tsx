const SignInBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-gradient-to-tl from-primary/10 via-transparent to-transparent rounded-full blur-3xl" />
    </div>
  );
};

export default SignInBackground;
