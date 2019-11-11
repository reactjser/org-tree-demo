import React, { Component, createRef } from 'react';
import orgTreeHelper from 'org-tree-helper';
import DatGui, { DatNumber } from 'react-dat-gui';
import { saveAs } from 'file-saver';
import treeData from './treeData';
import 'react-dat-gui/dist/index.css';

class App extends Component {
  svgRef = createRef();

  state = {
    viewBox: '0 0 0 0',
    pathData: '',
    nodesData: [],
    config: {
      spacingX: 20,
      spacingY: 40
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
      config: { spacingX, spacingY }
    } = this.state;
    const { pathData, nodesData, layoutExtents } = orgTreeHelper(treeData, [
      spacingX,
      spacingY
    ]);
    this.setState({
      pathData,
      nodesData,
      // viewBox: `0 0  ${layoutExtents.width} ${layoutExtents.height}`
      // 避免边框超出边界
      viewBox: `-1 -1  ${layoutExtents.width + 2} ${layoutExtents.height + 2}`
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

  handleExportSvg = () => {
    const svg = this.svgRef.current;

    // 获取解析后的svg内容
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);

    // 添加命名空间
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }
    if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
      );
    }

    // 添加xml声明
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    // 将svg转为URI data
    const url =
      'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);

    // 导出SVG文件
    saveAs(url, '组织架构图.svg');
  };

  handleExportPdf = () => {
    alert('TODO');
  };

  render() {
    const { config, viewBox, pathData, nodesData } = this.state;

    return (
      <>
        <div className="buttons-wrapper">
          <button onClick={this.handleExportSvg}>导出SVG</button>
          <button onClick={this.handleExportPdf}>导出PDF</button>
        </div>
        <DatGui data={config} onUpdate={this.handleConfigUpdate}>
          <DatNumber
            path="spacingX"
            label="水平内边距"
            min={0}
            max={100}
            step={1}
          />
          <DatNumber
            path="spacingY"
            label="垂直内边距"
            min={0}
            max={100}
            step={1}
          />
        </DatGui>
        <div className="App">
          <svg viewBox={viewBox} ref={this.svgRef}>
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
                      fill: '#1990FF',
                      textAnchor: 'middle',
                      cursor: 'pointer',
                      // 第三层及以下使用竖排文字
                      writingMode: d.depth <= 1 ? 'inherit' : 'tb'
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
                        fill: '#333',
                        textAnchor: 'middle'
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
