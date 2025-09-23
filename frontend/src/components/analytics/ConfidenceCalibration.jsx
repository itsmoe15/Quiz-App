// frontend/src/components/analytics/ConfidenceCalibration.jsx
import React from "react";

const ConfidenceCalibration = ({ analytics, detailedAnalytics }) => {
  if (!detailedAnalytics?.confidenceCalibration) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-semibold text-gray-700">
          No Confidence Data Available
        </h3>
        <p className="text-gray-600">
          Confidence calibration data will appear after students attempt the
          quiz.
        </p>
      </div>
    );
  }

  const calibrationData = detailedAnalytics.confidenceCalibration;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        Confidence Calibration Analysis
      </h2>

      {/* Calibration Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Calibration Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overall Calibration Gap:</span>
              <span
                className={`text-lg font-semibold ${
                  analytics.confidenceAccuracyCorrelation > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {analytics.confidenceAccuracyCorrelation > 0 ? "+" : ""}
                {analytics.confidenceAccuracyCorrelation.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {analytics.confidenceAccuracyCorrelation > 0.1
                ? "✅ Students are well-calibrated (confidence matches accuracy)"
                : analytics.confenceAccuracyCorrelation > -0.1
                ? "⚠️ Students are moderately calibrated"
                : "❌ Students are overconfident (confidence exceeds accuracy)"}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Calibration by Confidence Level
          </h3>
          <div className="space-y-2">
            {calibrationData.map((bin, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <span className="w-24">{bin.confidenceRange}</span>
                <div className="flex-1 mx-4">
                  <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-blue-500"
                      style={{ width: `${bin.averageConfidence}%` }}
                    ></div>
                    <div
                      className="absolute top-0 left-0 h-full bg-green-500 opacity-70"
                      style={{ width: `${bin.accuracy}%` }}
                    ></div>
                  </div>
                </div>
                <span className="w-20 text-right">
                  {bin.calibrationGap.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Blue: Confidence</span>
            <span>Green: Accuracy</span>
            <span>Gap</span>
          </div>
        </div>
      </div>

      {/* Calibration Table */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Detailed Calibration Data
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 px-4">Confidence Range</th>
                <th className="text-center py-2 px-4">Answers</th>
                <th className="text-center py-2 px-4">Avg Confidence</th>
                <th className="text-center py-2 px-4">Accuracy</th>
                <th className="text-center py-2 px-4">Calibration Gap</th>
                <th className="text-center py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {calibrationData.map((bin, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">
                    {bin.confidenceRange}
                  </td>
                  <td className="py-3 px-4 text-center">{bin.count}</td>
                  <td className="py-3 px-4 text-center">
                    {bin.averageConfidence.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    {bin.accuracy.toFixed(1)}%
                  </td>
                  <td
                    className={`py-3 px-4 text-center font-semibold ${
                      bin.calibrationGap > 5
                        ? "text-red-600"
                        : bin.calibrationGap < -5
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {bin.calibrationGap > 0 ? "+" : ""}
                    {bin.calibrationGap.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                        bin.calibrationGap > 5
                          ? "bg-red-100 text-red-800"
                          : bin.calibrationGap < -5
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {bin.calibrationGap > 5
                        ? "Underconfident"
                        : bin.calibrationGap < -5
                        ? "Overconfident"
                        : "Well-calibrated"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reliability Diagram */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Reliability Diagram
        </h3>
        <div className="relative h-64 bg-white rounded-lg p-4">
          {/* Perfect calibration line */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute bottom-0 left-0 w-full h-px bg-gray-300"></div>
            <div className="absolute bottom-0 left-0 w-px h-full bg-gray-300"></div>

            {/* Perfect calibration diagonal */}
            <div
              className="absolute bottom-0 left-0 w-full h-full"
              style={{
                background: `linear-gradient(to top right, 
                  transparent 0%, transparent calc(100% - 1px), 
                  #ccc calc(100% - 1px), #ccc 100%)`,
              }}
            ></div>

            {/* Actual calibration points */}
            {calibrationData.map((bin, index) => {
              const x = (index / (calibrationData.length - 1)) * 100;
              const yAccuracy = bin.accuracy;
              const yConfidence = bin.averageConfidence;

              return (
                <React.Fragment key={index}>
                  {/* Confidence point */}
                  <div
                    className="absolute w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1.5 -translate-y-1.5"
                    style={{ left: `${x}%`, bottom: `${yConfidence}%` }}
                    title={`Confidence: ${yConfidence}%`}
                  ></div>

                  {/* Accuracy point */}
                  <div
                    className="absolute w-3 h-3 bg-green-500 rounded-full transform -translate-x-1.5 -translate-y-1.5"
                    style={{ left: `${x}%`, bottom: `${yAccuracy}%` }}
                    title={`Accuracy: ${yAccuracy}%`}
                  ></div>

                  {/* Connection line */}
                  <div
                    className="absolute h-0.5 bg-red-500 transform -translate-y-0.5"
                    style={{
                      left: `${x}%`,
                      bottom: `${Math.min(yConfidence, yAccuracy)}%`,
                      width: "2px",
                      height: `${Math.abs(yConfidence - yAccuracy)}%`,
                    }}
                  ></div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Axes labels */}
          <div className="absolute -bottom-8 left-0 w-full text-center text-gray-600">
            Confidence Level
          </div>
          <div className="absolute top-0 -left-8 transform -rotate-90 origin-center text-center text-gray-600">
            Accuracy
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Confidence</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Accuracy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Calibration Gap</span>
          </div>
        </div>
      </div>

      {/* Interpretation Guide */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          How to Interpret Calibration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4">
            <div className="font-semibold text-green-600 mb-2">
              Well-Calibrated (Gap ±5%)
            </div>
            <p className="text-gray-600">
              Students accurately assess their knowledge. Confidence matches
              performance.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="font-semibold text-orange-600 mb-2">
              Overconfident (Gap &lt; -5%)
            </div>
            <p className="text-gray-600">
              Students are too confident. They think they know more than they
              actually do.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="font-semibold text-red-600 mb-2">
              Underconfident (Gap &gt; +5%)
            </div>
            <p className="text-gray-600">
              Students lack confidence. They perform better than they expect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceCalibration;
