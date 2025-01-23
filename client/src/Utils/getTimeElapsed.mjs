export const getTimeElapsed = (time) => {
  try {
    const now = Date.now();
    // Convert the 'fromDate' to a timestamp (milliseconds)
    const fromTimestamp = new Date(time).getTime();

    // Calculate the difference in milliseconds
    const diff = now - fromTimestamp;

    // Calculate time components
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24)) % 365;
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    if (years > 0) return `${years}y`;
    else if (weeks > 0) return `${weeks}w`;
    else if (days > 0) return `${days}d`;
    else if (hours > 0) return `${hours}h`;
    else if (minutes > 0) return `${minutes}m`;
    else return `${seconds}s`;
  } catch (error) {
    console.log("Error in calculating the time elapsed!");
    console.log(error);
  }
};
