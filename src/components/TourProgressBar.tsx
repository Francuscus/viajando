interface TourProgressBarProps {
  current: number;
  total: number;
}

const TourProgressBar = ({ current, total }: TourProgressBarProps) => {
  const percent = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="progress-bar-tour">
      <div
        className="progress-bar-tour-fill"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

export default TourProgressBar;
