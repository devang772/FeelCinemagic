import React, { useState, useEffect } from "react";
import Title from "../../components/admin/Title";
import Loading from "../../components/Loading";
import { Check, Star, Trash2 } from "lucide-react";
import { kConverter } from "../../lib/kConverter";
import { toast } from "react-hot-toast";
import BlurCircle from "../../components/BlurCircle";
import { useAppContext } from "../../context/AppContext";

const AddShows = () => {
  const { axios, getToken, user, image_base_url } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY || "$";

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const getNowPlayingMovies = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get("/api/show/now-playing", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        setNowPlayingMovies(data.movies);
      } else {
        toast.error(data.message || "Failed to fetch movies");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getNowPlayingMovies();
    }
  }, [user]);

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) {
      toast.error("Please select a date and time");
      return;
    }

    const [date, time] = dateTimeInput.split("T");

    setDateTimeSelection((prev) => {
      const existingTimes = prev[date] || [];

      if (existingTimes.includes(time)) {
        toast.error("This timing already exists");
        return prev;
      }

      return {
        ...prev,
        [date]: [...existingTimes, time],
      };
    });

    setDateTimeInput("");
  };

  const removeTiming = (date, time) => {
    setDateTimeSelection((prev) => {
      const updatedTimes = prev[date].filter((t) => t !== time);

      if (updatedTimes.length === 0) {
        const copy = { ...prev };
        delete copy[date];
        return copy;
      }

      return {
        ...prev,
        [date]: updatedTimes,
      };
    });
  };

  const handleAddShowSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMovie) {
      toast.error("Please select a movie");
      return;
    }

    if (Object.keys(dateTimeSelection).length === 0) {
      toast.error("Please select a date and time");
      return;
    }

    if (!showPrice) {
      toast.error("Please enter show price");
      return;
    }

    // Build showInput as array of {date, time[]} — matches backend shape
    const showInput = Object.entries(dateTimeSelection).map(([date, times]) => ({
      date,
      time: times,
    }));

    if (showInput.length === 0) {
      toast.error("Please add at least one show timing");
      return;
    }

    const payload = {
      movieId: selectedMovie,
      showInput,
      showPrice: Number(showPrice),
    };

    try {
      setSubmitting(true);

      const { data } = await axios.post("/api/show/add", payload, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (!data.success) {
        return toast.error(data.message || "Failed to create show");
      }

      toast.success("Show created successfully");

      setSelectedMovie(null);
      setShowPrice("");
      setDateTimeSelection({});
      setDateTimeInput("");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to create show");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (time) => {
    const [hourStr, minute] = time.split(":");
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="relative min-h-full w-full text-white">
      <BlurCircle top="-60px" left="-20px" />

      <Title text1="Add" text2="Shows" />

      <form onSubmit={handleAddShowSubmit} className="mt-10 flex flex-col gap-8">
        {/* Movie Selection */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-medium tracking-wide">
              Select Featured Movie
            </h3>
            <p className="text-xs text-white/40 mt-0.5">
              Pick a cataloged film from the running theater index
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {nowPlayingMovies.map((movie, index) => {
              // ✅ FIX: stringify the _id for reliable string comparison
              const movieId = String(movie.id);
              const isSelected = selectedMovie === movieId;

              return (
                <div
                  key={movieId || index}
                  // ✅ FIX: store stringified id, not the raw ObjectId object
                  onClick={() => setSelectedMovie(movieId)}
                  className={`relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer select-none transition-all duration-300 group border-2 ${
                    isSelected
                      ? "border-[#FF4D67] shadow-[0_0_20px_rgba(255,77,103,0.35)] scale-[0.98]"
                      : "border-white/10 hover:border-white/25 hover:-translate-y-1"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF4D67]/20 via-[#1A1015] to-black flex items-center justify-center p-4">
                    <p className="text-xs font-black tracking-widest uppercase text-white/30 text-center line-clamp-3">
                      {movie.title}
                    </p>
                  </div>

                  {movie.poster_path && (
                    <img
                      src={image_base_url + movie.poster_path}
                      alt={movie.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />

                  {isSelected && (
                    <div className="absolute top-3 right-3 z-30 flex items-center justify-center bg-[#FF4D67] h-7 w-7 rounded-xl shadow-lg border border-white/20">
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 z-20 p-3">
                    <h4 className="font-semibold text-white truncate text-sm">
                      {movie.title}
                    </h4>
                    <p className="text-xs text-gray-300 mt-1">
                      {movie.release_date || "Coming Soon"}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="flex items-center gap-1 text-[11px] font-bold font-mono text-white/90">
                        <Star className="w-3.5 h-3.5 text-[#FF4D67] fill-[#FF4D67]" />
                        {movie.vote_average
                          ? movie.vote_average.toFixed(1)
                          : "0.0"}
                      </p>
                      <p className="text-[10px] font-mono text-white/60">
                        {movie.vote_count ? kConverter(movie.vote_count) : "0"}{" "}
                        Votes
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Show Price */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Show Price
          </label>
          <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-lg bg-black/20">
            <span className="text-gray-400">{currency}</span>
            <input
              type="number"
              min={0}
              value={showPrice}
              onChange={(e) => setShowPrice(e.target.value)}
              placeholder="Enter show price"
              className="bg-transparent outline-none w-32"
            />
          </div>
        </div>

        {/* Date & Time Picker */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Select Date & Time
          </label>
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="datetime-local"
              value={dateTimeInput}
              onChange={(e) => setDateTimeInput(e.target.value)}
              className="bg-black/20 border border-gray-600 rounded-lg px-3 py-2 outline-none text-white"
            />
            <button
              type="button"
              onClick={handleDateTimeAdd}
              className="bg-primary px-4 py-2 rounded-lg text-white hover:opacity-90 transition"
            >
              Add Time
            </button>
          </div>
        </div>

        {/* Scheduled Timings */}
        {Object.keys(dateTimeSelection).length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-medium text-white/70">
              Scheduled Timings
            </h3>

            {Object.entries(dateTimeSelection)
              .sort(([a], [b]) => (a > b ? 1 : -1))
              .map(([date, times]) => (
                <div
                  key={date}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <p className="text-sm font-semibold text-white/80 mb-3">
                    📅 {formatDate(date)}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {times
                      .slice()
                      .sort()
                      .map((time) => (
                        <div
                          key={time}
                          className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/80"
                        >
                          <span className="font-mono">{formatTime(time)}</span>
                          <button
                            type="button"
                            onClick={() => removeTiming(date, time)}
                            className="text-white/30 hover:text-[#FF4D67] transition-colors"
                            aria-label={`Remove ${formatTime(time)} on ${formatDate(date)}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-fit bg-primary px-6 py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add Show"}
        </button>
      </form>

      <BlurCircle top="100px" right="-10%" />
    </div>
  );
};

export default AddShows;