function finalProj() {
    let filePath1 = "data/salaries.csv";
    let filePath2 = "data/country_code.csv";
    Promise.all([
        d3.csv(filePath1),
        d3.csv(filePath2)
    ]).then(function (files) {
        var data1 = files[0];
        var data2 = files[1];

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

        var result = data1.reduce(function (acc, t1) {
            var matchedRows = data2.filter(function (t2) {
                return t1.company_location === t2.Code;
            });

            matchedRows.forEach(function (row) {
                acc.push(Object.assign({}, t1, { country_name: row['Name'] }));
            });

            return acc;
        }, []);
        graph1(data1);
        graph2(result);
        graph3(data1);
    });
}

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

    const margin = { top: 20, right: 20, bottom: 20, left: 30 },
        width = canvasWidth - margin.left - margin.right,
        height = canvasHeight - margin.top - margin.bottom;

    const svg = d3
        .select("#remote-svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const colorScale = d3.scaleOrdinal()
        .domain([0, 1, 2])
        .range(["#98abc5", "#8a89a6", "#7b6888"]);

    let groups = svg.selectAll(".gbars")
        .data(result)
        .enter()
        .append('g')
        .attr('class', 'gbars')
        .style('fill', (d, i) => colorScale(i));

    const xScale = d3.scaleBand()
        .domain(years)
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    groups.selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.data.work_year))
        .attr("y", d => yScale(d[1]))
        .attr("height", d => yScale(d[0]) - yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .on("mouseover", function (d, i) {
            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", "2");

        })
        .on("mouseout", function (d, i) {
            d3.select(this)
                .style("stroke", "none");
        });

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2) + 5)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Remote Ratio by Work Year");

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", height - margin.bottom + 30)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .text("Work Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (height / 2) - 20)
        .attr("y", 0 - margin.left + 10)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .text("Remote Ratio");
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
        canvasHeight = 550

    const margin = { top: 20, right: 20, bottom: 10, left: 30 },
        width = canvasWidth - margin.left - margin.right,
        height = canvasHeight - margin.top - margin.bottom;

    d3.select("#region")
        .append("p")
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Average Salary For Full Time Jobs in 2023");

    const svg = d3
        .select("#region")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var color = d3.scaleQuantize()
        .domain(d3.extent(avg_sal.values()))
        .range(["#D8F3DC", "#74C69D", "#52B788", "#40916C", "#2D6A4F", "#081C15"])

    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", function (event) {
            svg.attr("transform", event.transform);
        });
    svg.call(zoom);

    // Reset button functionality
    const resetButton = d3.select("#region")
        .append("button")
        .attr("id", "reset-button")
        .text("Reset");
    resetButton.on("click", function () {
        svg.transition().duration(200).call(zoom.transform, d3.zoomIdentity);
    });

    // Zoom in button functionality
    const zoomInButton = d3.select("#region")
        .append("button")
        .attr("id", "zoom-in-button")
        .text("Zoom In");
    zoomInButton.on("click", function () {
        svg.transition().duration(500).call(zoom.scaleBy, 1.2);
    });

    // Zoom out button functionality
    const zoomOutButton = d3.select("#region")
        .append("button")
        .attr("id", "zoom-out-button")
        .text("Zoom Out");
    zoomOutButton.on("click", function () {
        svg.transition().duration(500).call(zoom.scaleBy, 0.8);
    });

    const projection = d3.geoNaturalEarth1();
    const pathgeo = d3.geoPath().projection(projection);

    const tooltip = d3.select("#region")
        .append("div")
        .attr("id", "map-tooltip")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("position", "absolute")
        .style("padding", "5px");;

    const worldmap = d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")

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
                    d3.select(this)
                        .style("fill", "#ef233c")
                } else {
                    tooltip.html(d.properties.name + "<br>" + "No Data")
                        .style("opacity", 1)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px")
                }
            })
            .on("mouseout", function () {
                tooltip.style("opacity", 0);
                d3.select(this)
                    .style("fill", d => {
                        if (avg_sal.has(d.properties.name)) {
                            return color(avg_sal.get(d.properties.name))
                        } else {
                            return "white"
                        }
                    }
                    )
            });
    });

    var canvasWidth2 = canvasWidth,
        canvasHeight2 = 60

    const margin2 = { top: 20, right: 20, bottom: 20, left: 30 },
        width2 = canvasWidth2 - margin2.left - margin2.right,
        height2 = canvasHeight2 - margin2.top - margin2.bottom;

    const svg2 = d3
        .select("#region")
        .append("svg")
        .attr("width", width2 + margin2.left + margin2.right)
        .attr("height", height2 + margin2.top + margin2.bottom)
        .append("g")
        .attr("transform", `translate(${margin2.left}, ${margin2.top})`);

    var legend_labels = ["No Data", "< $100K", "$100K - $120K", "$120K - $140K", "$140K - $160K", "$160K - $180K", "> $180K"]

    var legend = svg2.append("g")
        .attr("transform", "translate(0," + (height2 - 10) + ")")
        .attr("class", "legend");

    legend.selectAll("rect")
        .data(color.range().map(function (d, i) {
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
        .text("Full Time Average Salary in USD");

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
    const data3 = data.filter((d) => d.employment_type = 'FT')
    const avg_sal = d3.rollup(
        data3,
        (v) => d3.mean(v, (d) => d.salary_in_usd),
        (d) => d.work_year,
        (d) => d.experience_level
    )
    console.log(avg_sal);
    // const avg_sal2 = d3.rollup(
    //     data3,
    //     (v) => d3.mean(v, (d) => d.salary_in_usd),
    //     (d) => d.experience_level,
    //     (d) => d.work_year
    // )
    let avg = [];
    Array.from(avg_sal, (
        [key, value]) => (
        value.forEach((v, i) => {
            avg.push({ work_year: key, experience_level: i, avg_sal: v })
        }
        )
    )
    );
    console.log(avg);
    // let prop = [];
    // for (let [key, value] of avg_sal) {
    //     prop.push({ work_year: key, prop_0: 0, prop_50: 0, prop_100: 0 });
    // }

    // const en = avg_sal2.get('EN');
    // const mi = avg_sal2.get('MI');
    // const se = avg_sal2.get('SE');
    // const ex = avg_sal2.get('EX');
    // console.log(Array.from(avg_sal2, ([name, value]) => ({ name, value })));
    const years = Array.from(avg_sal.keys()).sort((a, b) => a - b);

    const margin = { top: 20, right: 20, bottom: 20, left: 30 },
        width = 600 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#salary")
        .append("svg")
        .attr("id", "#salary_svg")
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
        // .domain([2020, 2021, 2022, 2023])
        .domain(years)
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        // .domain([0, d3.max(Array.from(avg_sal2.values()).map((d) => d3.max(Array.from(d.values()))))])
        .domain([0, d3.max(Array.from(avg_sal.values()).map((d) => d3.max(Array.from(d.values()))))])
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    svg.selectAll("circle")
        .data(avg)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.work_year) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d.avg_sal))
        .attr("r", 5)
        .attr("fill", d => colorScale[d.experience_level]);


    // console.log(en);
    // console.log(mi);
    // console.log(se);
    // console.log(ex);
    // svg.selectAll("circle")
    //     .data(en)
    //     .enter()
    //     .append("circle")
    //     .attr("cx", (d, i) => xScale(d[0]) + xScale.bandwidth() / 2)
    //     .attr("cy", (d) => yScale(d[1]))
    //     .attr("r", 5)
    //     .attr("fill", colorScale['EN']);

    // svg.selectAll("circle")
    //     .data(mi)
    //     .enter()
    //     .append("circle")
    //     .attr("cx", (d, i) => xScale(d[0]) + xScale.bandwidth() / 2)
    //     .attr("cy", (d) => yScale(d[1]))
    //     .attr("r", 5)
    //     .attr("fill", colorScale['MI']);

    // svg.selectAll("circle")
    //     .data(se)
    //     .enter()
    //     .append("circle")
    //     .attr("cx", (d, i) => xScale(d[0]) + xScale.bandwidth() / 2)
    //     .attr("cy", (d) => yScale(d[1]))
    //     .attr("r", 5)
    //     .attr("fill", colorScale['SE']);

    // svg.selectAll("circle")
    //     .data(ex)
    //     .enter()
    //     .append("circle")
    //     .attr("cx", (d, i) => xScale(d[0]) + xScale.bandwidth() / 2)
    //     .attr("cy", (d) => yScale(d[1]))
    //     .attr("r", 5)
    //     .attr("fill", colorScale['EX']);
}