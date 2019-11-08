import React, { Component } from "react";
import orgTreeHelper from "org-tree-helper";
import DatGui, { DatNumber } from "react-dat-gui";
import treeData from "./treeData";
import "react-dat-gui/dist/index.css";

class App extends Component {
  state = {
    viewBox: "0 0 0 0",
    pathData: "",
    nodesData: [],
    config: {
      spacingX: 40,
      spacingY: 20
    }
  };

  componentDidMount() {
    this.draw();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.config.spacingX !== this.state.config.spacingX ||
      prevState.config.spacingY !== this.state.config.spacingY
    ) {
      this.draw();
    }
  }

  draw() {
    const {
      config: { spacingY, spacingX }
    } = this.state;
    const { pathData, nodesData, layoutExtents } = orgTreeHelper(treeData, [
      spacingY,
      spacingX
    ]);
    this.setState({
      pathData,
      nodesData,
      viewBox: `0 0  ${layoutExtents.width} ${layoutExtents.height}`
    });
  }

  handleConfigUpdate = newData => {
    this.setState(prevState => ({
      config: { ...prevState.config, ...newData }
    }));
  };

  handleDeparemntClick = data => {
    alert(`You clicked ${data.department}`);
  };

  render() {
    const { config, viewBox, pathData, nodesData } = this.state;

    return (
      <>
        <DatGui data={config} onUpdate={this.handleConfigUpdate}>
          <DatNumber
            path="spacingY"
            label="水平内边距"
            min={0}
            max={100}
            step={1}
          />
          <DatNumber
            path="spacingX"
            label="垂直内边距"
            min={0}
            max={100}
            step={1}
          />
        </DatGui>
        <div className="App">
          <svg viewBox={viewBox}>
            <g>
              {pathData && (
                <path d={pathData} stroke="#567ad4" strokeLinecap="round" />
              )}
              {nodesData.map(d => (
                <g
                  key={d.data.departmentId}
                  transform={`translate(${d.x},${d.y})`}
                >
                  <rect
                    x={-d.width / 2}
                    y={0}
                    width={d.width}
                    height={d.height}
                    rx={2}
                    ry={2}
                    stroke="#567ad4"
                    fill="rgb(86,122,212)"
                    fillOpacity="0.09"
                  />
                  <text
                    y={d.depth <= 1 ? 20 : d.height / 2}
                    style={{
                      fontSize: 15,
                      fill: "#1990FF",
                      textAnchor: "middle",
                      cursor: "pointer",
                      // 第三层及以下使用竖排文字
                      writingMode: d.depth <= 1 ? "inherit" : "tb"
                    }}
                    onClick={() => {
                      this.handleDeparemntClick(d.data);
                    }}
                  >
                    {d.data.department}
                  </text>

                  {/* 前两层显示部门领导人 */}
                  {d.depth <= 1 && (
                    <text
                      y={40}
                      style={{
                        fontSize: 12,
                        fill: "#333",
                        textAnchor: "middle"
                      }}
                    >
                      {d.data.name}
                    </text>
                  )}
                </g>
              ))}
            </g>
          </svg>
        </div>
      </>
    );
  }
}

export default App;
