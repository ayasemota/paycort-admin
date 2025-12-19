"use client";
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import Preloader from "@/app/components/Preloader";
import Logo from "../components/Logo";

type WaitlistEntry = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  createdAt: any;
};

export default function AdminDashboard() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("all");
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [displayCount, setDisplayCount] = useState(20);
  const router = useRouter();

  useEffect(() => {
    const isAuth = sessionStorage.getItem("adminAuth");
    if (!isAuth) {
      router.push("/login");
      return;
    }

    const q = query(
      collection(db, "paycortWaitlist"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as WaitlistEntry)
        );
        setEntries(data);
        setLoading(false);
        setIsOnline(true);
      },
      (error) => {
        console.error("Firebase error:", error);
        setIsOnline(false);
        setLoading(false);
        setEntries([]);
      }
    );

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    router.push("/login");
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.phone.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterDate === "all") return matchesSearch;
    const timestamp = entry.createdAt as { toDate?: () => Date };
    const entryDate = timestamp?.toDate?.();
    const today = new Date();
    if (filterDate === "today")
      return (
        entryDate?.toDateString() === today.toDateString() && matchesSearch
      );
    if (filterDate === "week") {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return entryDate && entryDate >= weekAgo && matchesSearch;
    }
    return matchesSearch;
  });

  const sortedEntries = sortNewestFirst
    ? filteredEntries
    : [...filteredEntries].reverse();

  const displayedEntries = sortedEntries.slice(0, displayCount);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        setDisplayCount((prev) => Math.min(prev + 20, sortedEntries.length));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sortedEntries.length]);

  useEffect(() => {
    setDisplayCount(20);
  }, [searchTerm, filterDate, sortNewestFirst]);

  const exportToCSV = () => {
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Date Joined",
    ];
    const rows = sortedEntries.map((entry) => [
      entry.firstName,
      entry.lastName,
      entry.email,
      entry.phone,
      entry.createdAt?.toDate().toLocaleDateString() || "N/A",
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paycort-waitlist-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
  };

  const todayCount = entries.filter((e) => {
    const date = e.createdAt as { toDate?: () => Date };
    return date?.toDate?.()?.toDateString() === new Date().toDateString();
  }).length;
  const weekCount = entries.filter((e) => {
    const date = e.createdAt as { toDate?: () => Date };
    const entryDate = date?.toDate?.();
    return (
      entryDate && entryDate >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
  }).length;

  if (loading) return <Preloader />;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed top-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 gap-4 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center justify-center gap-4">
              <Logo />
            </div>
            <div>
              <p className="text-sm font-medium text-green-200">
                Admin Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isOnline ? "bg-white/10" : "bg-red-500/20"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isOnline ? "bg-green-400 animate-pulse" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm">{isOnline ? "Live" : "Offline"}</span>
            </div>
            <button
              onClick={exportToCSV}
              className="hidden md:flex px-4 py-2 bg-green-200 hover:bg-green-100 rounded-lg font-medium transition-all duration-300 text-sm cursor-pointer"
            >
              Export CSV
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-700 hover:bg-red-700/80 rounded-lg font-medium transition-all duration-300 text-sm bg-red cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="pt-34 sm:pt-24 pb-8 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">Total Signups</span>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-4xl font-bold">{entries.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">Today</span>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-4xl font-bold text-green-400">{todayCount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">This Week</span>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-4xl font-bold text-blue-400">{weekCount}</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:bg-white/20 focus:border-green-400 focus:outline-none transition-all duration-300 placeholder-gray-400"
            />
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:bg-white/20 focus:border-green-400 focus:outline-none transition-all duration-300"
            >
              <option value="all" className="bg-gray-900">
                All Time
              </option>
              <option value="today" className="bg-gray-900">
                Today
              </option>
              <option value="week" className="bg-gray-900">
                This Week
              </option>
            </select>
            <button
              onClick={() => setSortNewestFirst(!sortNewestFirst)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 whitespace-nowrap cursor-pointer"
            >
              {sortNewestFirst ? "↓ Newest" : "↑ Oldest"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center justify-center">
          {displayedEntries.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-12">
              No entries found
            </div>
          ) : (
            displayedEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 overflow-hidden hover:scale-[1.02] hover:border-green-400"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-200 to-green-100 flex items-center justify-center text-white font-bold">
                    {entry.firstName[0]}
                    {entry.lastName[0]}
                  </div>
                  <div>
                    <p className="font-bold">
                      {entry.firstName} {entry.lastName}
                    </p>
                    <p className="text-xs text-gray-400">#{index + 1}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">📧 {entry.email}</p>
                  <p className="text-gray-300">📱 {entry.phone}</p>
                  <p className="text-gray-400 text-xs">
                    🕐{" "}
                    {(() => {
                      const timestamp = entry.createdAt as {
                        toDate?: () => Date;
                      };
                      const date = timestamp?.toDate?.();
                      return date
                        ? date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A";
                    })()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          Showing {displayedEntries.length} of {sortedEntries.length} entries{" "}
          {sortedEntries.length !== entries.length &&
            `(${entries.length} total)`}
          {displayedEntries.length < sortedEntries.length && (
            <span className="block mt-2 text-green-400">
              Scroll down to load more...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
