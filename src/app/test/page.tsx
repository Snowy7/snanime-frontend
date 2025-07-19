"use client";

export default function Test() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">CORS Test - Via Web Server</h1>
      <video width="640" height="360" controls>
        <source
          src="https://sa.anslayer.com/one_piece_1999/1/s.mp4?token=H2KYP8kcFDNzXatcfm37AQ&expires=1752435089&?"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
