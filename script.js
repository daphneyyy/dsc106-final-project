function finalProj() {
    let filePath1 = "salaries.csv";
    let filePath2 = "country_code.csv";
    let filePath3 = "data_by_categories.csv";
    Promise.all([
        d3.csv(filePath1),
        d3.csv(filePath2),
        d3.csv(filePath3)
    ]).then(function (files) {
        var data1 = files[0];
        var data2 = files[1];
        var data3 = files[2];

        data1.forEach((d) => {
            d.work_year = parseInt(d.work_year),
                d.salary = parseInt(d.salary),
                d.salary_in_usd = parseInt(d.salary_in_usd),
                d.remote_ratio = parseInt(d.remote_ratio)
        });

        data2.forEach((d) => {
            if (d.Code == "KP") {
                d.Name = "North Korea";
            } else if (d.Code == "KR") {
                d.Name = "South Korea";
            } else if (d.Code == "BS") {
                d.Name = "The Bahamas";
            } else if (d.Code == "BO") {
                d.Name = "Bolivia";
            } else if (d.Code == "BN") {
                d.Name = "Brunei";
            } else if (d.Code == "CD") {
                d.Name = "Democratic Republic of the Congo";
            } else if (d.Code == "CG") {
                d.Name = "Republic of the Congo";
            } else if (d.Code == "CY") {
                d.Name = "Northern Cyprus";
            } else if (d.Code == "FK") {
                d.Name = "Falkland Islands";
            } else if (d.Code == "GB") {
                d.Name = "England";
            } else if (d.Code == "GW") {
                d.Name = "Guinea Bissau";
            } else if (d.Code == "IR") {
                d.Name = "Iran";
            } else if (d.Code == "LA") {
                d.Name = "Laos";
            } else if (d.Code == "MD") {
                d.Name = "Moldova";
            } else if (d.Code == "MK") {
                d.Name = "Macedonia";
            } else if (d.Code == "RU") {
                d.Name = "Russia";
            } else if (d.Code == "SO") {
                d.Name = "Somaliland";
            } else if (d.Code == "RS") {
                d.Name = "Republic of Serbia";
            } else if (d.Code == "SY") {
                d.Name = "Syria";
            } else if (d.Code == "TL") {
                d.Name = "East Timor";
            } else if (d.Code == "TW") {
                d.Name = "Taiwan";
            } else if (d.Code == "TZ") {
                d.Name = "United Republic of Tanzania";
            } else if (d.Code == "US") {
                d.Name = "USA";
            } else if (d.Code == "VE") {
                d.Name = "Venezuela";
            } else if (d.Code == "VN") {
                d.Name = "Vietnam";
            } else if (d.Code == "CI") {
                d.Name = "Ivory Coast";
            } else if (d.Code == "TF") {
                d.Name = "French Southern and Antarctic Lands";
            } else if (d.Code == "PS") {
                d.Name = "West Bank";
            }
        });

        data3.forEach((d) => {
            d.salary_in_usd = parseInt(d.salary_in_usd)
        });

        var result = data1.reduce((acc, t1) => {
            var matchedRows = data2.filter(function (t2) {
                return t1.company_location === t2.Code;
            });

            matchedRows.forEach((row) => {
                acc.push(Object.assign({}, t1, { country_name: row['Name'] }));
            });

            return acc;
        }, []);
        graph1(data1);
        graph2(result);
        graph3(data1);
        graph4(data3);
    });
}

// bars
function graph1(data) {
    // preprocess data
    const remote2 = d3.rollup(
        data,
        (v) => v.length,
        (d) => d.work_year
    )
    const remote1 = d3.rollup(
        data,
        (v) => v.length,
        (d) => d.work_year,
        (d) => d.remote_ratio
    )
    let prop = [];
    for (let [key, value] of remote1) {
        prop.push({ work_year: key, prop_0: 0, prop_50: 0, prop_100: 0 });
    }
    let temp = [];
    for (let [key, value] of remote1) {
        for (let [key1, value1] of value) {
            if (key1 == 0) {
                temp.push({ work_year: key, prop_0: value1 / remote2.get(key) });
            } else if (key1 == 50) {
                temp.push({ work_year: key, prop_50: value1 / remote2.get(key) });
            } else {
                temp.push({ work_year: key, prop_100: value1 / remote2.get(key) });
            }
        }
    }
    for (let i = 0; i < prop.length; i++) {
        for (let j = 0; j < temp.length; j++) {
            if (prop[i].work_year == temp[j].work_year) {
                if (temp[j].prop_0 != undefined) {
                    prop[i].prop_0 = temp[j].prop_0;
                } else if (temp[j].prop_50 != undefined) {
                    prop[i].prop_50 = temp[j].prop_50;
                } else {
                    prop[i].prop_100 = temp[j].prop_100;
                }
            }
        }
    }

    const years = Array.from(remote1.keys()).sort((a, b) => a - b);

    const obs = Object.keys(prop[0]).filter((d) => d != "work_year");
    const stack = d3.stack().keys(obs);
    const result = stack(prop);

    var canvasWidth = 600,
        canvasHeight = 500

    const margin = { top: 20, right: 60, bottom: 20, left: 30 },
        width = canvasWidth - margin.left - margin.right,
        height = canvasHeight - margin.top - margin.bottom;

    const tooltip = d3.select("#remote")
        .append("div")
        .attr("id", "remote-tooltip")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("position", "absolute")
        .style("padding", "5px");

    const svg = d3
        .select("#remote-svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const colorScale = d3.scaleOrdinal()
        .domain([0, 1, 2])
        .range(["#98abc5", "#8a89a6", "#7b6888"]);

    const legends = {
        "prop_0": "On-site",
        "prop_50": "Hybird",
        "prop_100": "Fully remote"
    }

    const xScale = d3.scaleBand()
        .domain(years)
        .range([margin.left, width - margin.right])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    svg.selectAll(".gbars")
        .data(result)
        .enter()
        .append('g')
        .attr('class', 'gbars')
        .style('fill', (d, i) => colorScale(i))
        .selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.data.work_year))
        .attr("y", d => yScale(d[1]))
        .attr("height", d => yScale(d[0]) - yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .on("mouseover", function (e, d) {
            const curValue = d[1] - d[0];
            let curKey = null;
            for (const key in d.data) {
                if (Math.abs(d.data[key] - curValue) < 0.0001) {
                    curKey = key;
                    break;
                }
            }
            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", "2");
            tooltip
                .html(
                    legends[curKey] + "<br>" +
                    d3.format(".2%")(d[1] - d[0])
                )
                .style("opacity", 1)
                .style("left", (e.pageX + 10) + "px")
                .style("top", (e.pageY + 10) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.style("opacity", 0).style("left", 0).style("top", 0);
            d3.select(this).style("stroke", "none");
        })
        .on("mousemove", function (e, d) {
            tooltip
                .style("left", (e.pageX + 10) + "px")
                .style("top", (e.pageY + 10) + "px");
        });

    const legend = svg.append("g")
        .attr("font-size", 13)
        .style("font-family", "Segoe UI")
        .selectAll("g")
        .data(obs)
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(0, ${margin.top + i * height / 20})`);

    legend.append("rect")
        .attr("x", width - margin.right)
        .attr("width", height / 20 - 1)
        .attr("height", height / 20 - 1)
        .attr("fill", (d, i) => colorScale(i));

    legend.append("text")
        .attr("x", width - margin.right + height / 20)
        .attr("y", height / 40 - 1)
        .attr("dy", "0.32em")
        .text(d => legends[d]);

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2) + 5)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-family", "Segoe UI")
        .style("font-weight", "bold")
        .text("Job Remoteness by Year");

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", height - margin.bottom + 30)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .style("font-family", "Segoe UI")
        .text("Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (height / 2) - 20)
        .attr("y", 0 - margin.left + 20)
        .attr("text-anchor", "middle")
        .style("font-family", "Segoe UI")
        .style("font-size", "15px")
        .text("Proportion of Remoteness");
}

// maps
function graph2(data) {
    // preprocess data
    const sal_2023 = data.filter((d) => d.work_year = 2023)
    const avg_sal = d3.rollup(
        sal_2023,
        (v) => d3.mean(v, (d) => d.salary_in_usd),
        (d) => d.country_name
    )

    var canvasWidth = 1000,
        canvasHeight = 500

    const margin = { top: 20, right: 20, bottom: 10, left: 30 },
        width = canvasWidth - margin.left - margin.right,
        height = canvasHeight - margin.top - margin.bottom;

    const svg = d3
        .select("#region-svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, 0)`);

    var color = d3.scaleQuantize()
        .domain(d3.extent(avg_sal.values()))
        .range(["#D8F3DC", "#74C69D", "#52B788", "#40916C", "#2D6A4F", "#081C15"])

    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", event => {
            svg.attr("transform", event.transform);
        });
    svg.call(zoom);

    // Reset button functionality
    const resetButton = d3.select(".buttons")
        .append("button")
        .attr("id", "reset-button")
        .text("Reset");
    resetButton.on("click", () => {
        svg.transition().duration(200).call(zoom.transform, d3.zoomIdentity);
    });

    // Zoom in button functionality
    const zoomInButton = d3.select(".buttons")
        .append("button")
        .attr("id", "zoom-in-button")
        .text("+");
    zoomInButton.on("click", () => {
        svg.transition().duration(500).call(zoom.scaleBy, 1.2);
    });

    // Zoom out button functionality
    const zoomOutButton = d3.select(".buttons")
        .append("button")
        .attr("id", "zoom-out-button")
        .text("-");
    zoomOutButton.on("click", () => {
        svg.transition().duration(500).call(zoom.scaleBy, 0.8);
    });

    const projection = d3.geoNaturalEarth1();
    const pathgeo = d3.geoPath().projection(projection);

    const tooltip = d3.select("#region")
        .append("div")
        .attr("id", "map-tooltip")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("position", "absolute")
        .style("padding", "5px");

    const worldmap = d3.json("world.geojson")

    worldmap.then(function (map) {
        svg.append('path')
            .attr('class', 'sphere')
            .attr('d', pathgeo({ type: 'Sphere' }))
            .attr("fill", "skyblue");

        svg.selectAll("path")
            .data(map.features)
            .enter().append("path").attr("d", pathgeo)
            .attr("fill", d => {
                if (avg_sal.has(d.properties.name)) {
                    return color(avg_sal.get(d.properties.name))
                } else {
                    return "white"
                }
            })
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("opacity", 0.8)
            .on("mouseover", function (event, d) {
                if (avg_sal.has(d.properties.name)) {
                    tooltip.html(
                        d.properties.name + "<br>"
                        + avg_sal.get(d.properties.name).toLocaleString(
                            'en-US', { style: 'currency', currency: 'USD' }
                        ))
                        .style("opacity", 1)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                } else {
                    tooltip.html(d.properties.name + "<br>" + "No Data")
                        .style("opacity", 1)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px")
                }
                d3.select(this).style("stroke-width", 2);
            })
            .on("mouseout", function () {
                tooltip.style("opacity", 0).style("left", 0).style("top", 0);
                d3.select(this).style("stroke-width", 0.5);
            });
    });

    var canvasWidth2 = canvasWidth,
        canvasHeight2 = 130

    const margin2 = { top: 30, right: 20, bottom: 50, left: 30 },
        width2 = canvasWidth2 - margin2.left - margin2.right,
        height2 = canvasHeight2 - margin2.top - margin2.bottom;

    const svg2 = d3
        .select("#legend-svg")
        .attr("width", width2 + margin2.left + margin2.right)
        .attr("height", height2 + margin2.top + margin2.bottom)
        .append("g")
        .attr("transform", `translate(${margin2.left}, ${margin2.top})`);

    var legend_labels = ["No Data", "< $100K", "$100K - $120K", "$120K - $140K", "$140K - $160K", "$160K - $180K", "> $180K"]

    var legend = svg2.append("g")
        .attr("transform", "translate(0," + (height2 - 10) + ")")
        .attr("class", "legend");

    legend.selectAll("rect")
        .data(color.range().map((d, i) => {
            return {
                x0: i ? width2 / 6 * i : width2 / 6 * i,
                x1: i ? width2 / 6 * i + width2 / 6 : width2 / 6 * i + width2 / 6,
                z: d
            };
        }))
        .enter().append("rect")
        .attr("class", "bars")
        .attr("height", 10)
        .attr("x", d => d.x0)
        .attr("width", d => canvasWidth2 / 6)
        .style("fill", d => d.z);

    legend.append("text")
        .attr("class", "label")
        .attr("x", 0)
        .attr("y", -10)
        .style("font-family", "Segoe UI")
        .style("font-size", 20)
        .text("Salary in USD");

    legend.selectAll("text")
        .data(legend_labels)
        .enter().append("text")
        .attr("class", "label")
        .attr("x", (d, i) => width2 / 6 * (i - 1) + 10)
        .attr("y", 30)
        .text(d => d);
}

// line chart
function graph3(data) {
    // preprocess data
    const data3 = data.filter((d) => d.employment_type = 'FT')
    const avg_sal = d3.rollup(
        data3,
        (v) => d3.mean(v, (d) => d.salary_in_usd),
        (d) => d.experience_level,
        (d) => d.work_year
    );
    let avg = [];
    Array.from(avg_sal, (
        [key, value]) => (
        value.forEach((v, i) => {
            avg.push({ work_year: i, experience_level: key, avg_sal: v })
        })
    ));

    const years = Array.from(avg_sal.get("MI").keys()).sort((a, b) => a - b)

    const margin = { top: 20, right: 40, bottom: 20, left: 40 },
        width = 600 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    const tooltip = d3.select("#salary")
        .append("div")
        .attr("id", "salary-tooltip")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "5px");

    const svg = d3.select("#salary-svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const colorScale = {
        'EN': '#78abc5',
        'MI': '#8d19a6',
        'SE': '#13682b',
        'EX': '#ab486b',
    }

    const xScale = d3.scaleBand()
        .domain(years)
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(Array.from(avg_sal.values()).map((d) => d3.max(Array.from(d.values())))) + 20000])
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    function add_xy_lines(d) {
        // Add vertical line
        svg.append("line")
            .attr("class", "x-line")
            .attr("x1", xScale(d.work_year) + xScale.bandwidth() / 2)
            .attr("x2", xScale(d.work_year) + xScale.bandwidth() / 2)
            .attr("y1", yScale(d.avg_sal))
            .attr("y2", height - margin.bottom)
            .attr("stroke", "black")
            .attr("stroke-dasharray", "3,3");

        // Add horizontal line
        svg.append("line")
            .attr("class", "y-line")
            .attr("y1", yScale(d.avg_sal))
            .attr("y2", yScale(d.avg_sal))
            .attr("x1", margin.left)
            .attr("x2", xScale(d.work_year) + xScale.bandwidth() / 2)
            .attr("stroke", "black")
            .attr("stroke-dasharray", "3,3");
    }

    // add points
    svg.selectAll("circle")
        .data(avg)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.work_year) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d.avg_sal))
        .attr("r", 5)
        .attr("class", d => d.experience_level)
        .attr("fill", d => colorScale[d.experience_level])
        .on("mouseover", function (e, d) {
            const lineOpacity = d3.select("." + d.experience_level).style("opacity");
            if (lineOpacity !== "0") {
                d3.select(this).attr("r", 8);
                if (d.work_year !== 2020) {
                    const preSal = avg_sal.get(d.experience_level).get(d.work_year - 1);
                    tooltip
                        .html(
                            "Year: " + d.work_year + "<br>" +
                            "Experience Level: " + d.experience_level + "<br>" +
                            "Average Salary: " + d.avg_sal.toLocaleString(
                                'en-US', { style: 'currency', currency: 'USD' }
                            ) + "<br>" +
                            "Change: " + ((d.avg_sal - preSal) / preSal * 100).toFixed(2) + "%"
                        )
                } else {
                    tooltip
                        .html(
                            "Year: " + d.work_year + "<br>" +
                            "Experience Level: " + d.experience_level + "<br>" +
                            "Average Salary: " + d.avg_sal.toLocaleString(
                                'en-US', { style: 'currency', currency: 'USD' }
                            )
                        )
                }
                tooltip
                    .style("opacity", 1)
                    .style("left", (e.pageX + 10) + "px")
                    .style("top", (e.pageY + 10) + "px");
                add_xy_lines(d);
            }
        })
        .on("mouseout", function () {
            d3.select(this).attr("r", 5);
            tooltip.style("opacity", 0).style("left", 0).style("top", 0);
            svg.selectAll(".x-line").remove();
            svg.selectAll(".y-line").remove();
        })
        .on("mousemove", function (e, d) {
            const lineOpacity = d3.select("." + d.experience_level).style("opacity");
            if (lineOpacity !== "0") {
                tooltip
                    .style("left", (e.pageX + 10) + "px")
                    .style("top", (e.pageY + 10) + "px");

                add_xy_lines(d);
            }
        });

    // add lines
    const line = d3.line()
        .x(d => xScale(d[0]) + xScale.bandwidth() / 2)
        .y(d => yScale(d[1]))
        .curve(d3.curveMonotoneX);

    svg.append("path")
        .datum(Array.from(avg_sal.get('EN')).sort((a, b) => a[0] - b[0]))
        .attr("class", "EN")
        .attr("fill", "none")
        .attr("stroke", colorScale['EN'])
        .attr("stroke-width", 1.5)
        .attr("d", line);

    svg.append("path")
        .datum(Array.from(avg_sal.get('MI')).sort((a, b) => a[0] - b[0]))
        .attr("class", "MI")
        .attr("fill", "none")
        .attr("stroke", colorScale['MI'])
        .attr("stroke-width", 1.5)
        .attr("d", line);

    svg.append("path")
        .datum(Array.from(avg_sal.get('SE')).sort((a, b) => a[0] - b[0]))
        .attr("class", "SE")
        .attr("fill", "none")
        .attr("stroke", colorScale['SE'])
        .attr("stroke-width", 1.5)
        .attr("d", line);

    svg.append("path")
        .datum(Array.from(avg_sal.get('EX')).sort((a, b) => a[0] - b[0]))
        .attr("class", "EX")
        .attr("fill", "none")
        .attr("stroke", colorScale['EX'])
        .attr("stroke-width", 1.5)
        .attr("d", line);

    // Add legends text
    const legend = svg.append("g")
        .attr("font-size", 12)
        .style("font-family", "Segoe UI")
        .selectAll("g")
        .data(Object.keys(colorScale))
        .enter()
        .append("g")
        .attr("cursor", "pointer")
        .on("click", d => {
            var ele = d.srcElement.__data__
            var elements = d3.selectAll("." + ele)
            elements.transition().style("opacity", () => {
                return elements.style("opacity") == 1 ? 0 : 1;
            });
            d3.selectAll(".legend-" + ele).transition().style("opacity", () => {
                return elements.style("opacity") == 1 ? 0.4 : 1;
            });
        })

    legend.append("circle")
        .attr("class", d => "legend-" + d)
        .attr('cx', (d, i) => i * 100 + 90)
        .attr('cy', 25)
        .attr('r', 6)
        .style("fill", d => colorScale[d]);

    legend.append("text")
        .attr("class", d => "legend-" + d)
        .attr('x', (d, i) => 100 + i * 100)
        .attr('y', 30)
        .text(d => d)
        .style("fill", d => colorScale[d])
        .style("font-size", 15)
        .style("font-family", "Segoe UI")

    // Add title
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2) + 5)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-family", "Segoe UI")
        .style("font-weight", "bold")
        .text("Average Salary by Experience Level");

    // Add x-axis label
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", height - margin.bottom + 30)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .style("font-family", "Segoe UI")
        .text("Year");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (height / 2) - 20)
        .attr("y", 0 - margin.left + 25)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .style("font-family", "Segoe UI")
        .text("Salary in USD");
}

function graph4(data) {
    const mean_sal_by_cat = d3.rollup(
        data,
        v => d3.mean(v, d => d.salary_in_usd),
        d => d.category
    )

    const mean_sal_by_subcat = d3.rollup(
        data,
        v => d3.mean(v, d => d.salary_in_usd),
        d => d.category,
        d => d.full_category
    )

    var nodes = [{ id: "Data Science Jobs", value: 0 }];
    var links = [];

    mean_sal_by_cat.forEach((val, key) => {
        nodes.push({ id: key, value: val })
        links.push({ source: "Data Science Jobs", target: key })
    })

    mean_sal_by_subcat.forEach((val, key) => {
        val.forEach((v, k) => {
            if (k !== key) {
                nodes.push({ id: k, value: v })
                links.push({ source: key, target: k })
            }
        })
    })

    const graph = {
        nodes: nodes,
        links: links
    }

    const margin = { top: 40, right: 40, bottom: 20, left: 40 },
        width = 1000 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    const tooltip = d3.select("#salary-by-jobs")
        .append("div")
        .attr("id", "force-tooltip")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("position", "absolute")
        .style("padding", "5px");

    const simulation = d3.forceSimulation(graph.nodes)
        .force("link", d3.forceLink(graph.links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(40).strength(0.8))

    const svg = d3
        .select("#force-svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const colorScale = d3.scaleOrdinal()
        .domain(mean_sal_by_cat.keys())
        .range(d3.schemeSet3);

    const nodeSize = d3.scaleLinear()
        .domain(d3.extent(graph.nodes, d => d.value))
        .range([10, 30]);

    // Create links
    const link = svg
        .selectAll("line")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("stroke", "lightgray")
        .attr("stroke-width", 3);

    function mouseover(e, d) {
        if (d.id !== "Data Science Jobs") {
            d3.select(this).style("cursor", "pointer")
            tooltip.style("opacity", 1)
                .style("left", (e.pageX + 10) + "px")
                .style("top", (e.pageY + 10) + "px")
                .html("<strong>" + d.id + "</strong><br/>" + "" + d.value.toLocaleString(
                    'en-US', { style: 'currency', currency: 'USD' }
                ));
        }
    }

    // Create nodes
    const node = svg
        .selectAll("ellipses")
        .data(graph.nodes)
        .enter()
        .append("ellipse")
        .attr("rx", d => {
            if (d.id === "Data Science Jobs") {
                return 40;
            } else {
                return nodeSize(d.value) + 5
            }
        })
        .attr("ry", d => {
            if (d.id === "Data Science Jobs") {
                return 30;
            } else {
                return nodeSize(d.value)
            }
        })
        .attr("fill", d => {
            const lst = d.id.split(" ");
            if (d.id === "Data Science Jobs") {
                return "white";
            } else {
                return colorScale(lst[lst.length - 1]);
            }
        })
        .attr("stroke", "gray")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        )
        .on("mouseover", mouseover)
        .on("mouseout", function (e, d) {
            tooltip.style("opacity", 0).style("left", 0).style("top", 0);
        })

    // Add text to nodes
    const texts = svg
        .selectAll("text")
        .data(graph.nodes)
        .enter()
        .append("text")
        .text(d => d.id)
        .attr("font-size", 12)
        .attr("dx", 15)
        .attr("dy", 4)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-family", "Segoe UI")
        .on("mouseover", mouseover)
        .on("mouseout", function (e, d) {
            tooltip.style("opacity", 0).style("left", 0).style("top", 0);
        })

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        node.attr("cx", d => d.x).attr("cy", d => d.y);
        texts.attr("x", d => d.x - nodeSize(d.value) + 5).attr("y", d => d.y - 2);

        const padding = 2;
        node.attr("cx", d => Math.max(padding, Math.min(width - padding, d.x)))
            .attr("cy", d => Math.max(padding, Math.min(height - padding, d.y)));
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // add title
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .style("font-size", 20)
        .style("font-weight", "bold")
        .style("font-family", "Segoe UI")
        .text("Average Salary per Year by Job Titles");
}