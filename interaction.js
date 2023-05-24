function finalProj() {
    let filePath = "salaries.csv";
    d3.csv(filePath).then(function (data) {
        //preprocess data
        data.forEach((d) => {
            d.work_year = parseInt(d.work_year),
                d.salary = parseInt(d.salary),
                d.salary_in_usd = parseInt(d.salary_in_usd),
                d.remote_ratio = parseInt(d.remote_ratio)
        });
        console.log(data[0]);
        graph1(data);
        // question2(data);
        // question3(data);
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
    console.log(prop);
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

    console.log(prop);

    const years = Array.from(remote1.keys()).sort((a, b) => a - b);

    const obs = Object.keys(prop[0]).filter((d) => d != "work_year");
    const stack = d3.stack().keys(obs);
    const result = stack(prop);
    console.log(obs);

    const margin = { top: 20, right: 20, bottom: 20, left: 30 },
        width = 600 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    const svg = d3
        .select("#remote")
        .append("svg")
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


    const legend = svg.append("g")
        .attr("transform", `translate(${width - margin.right}, ${margin.top})`)
        .attr("text-anchor", "end")
        .style("font", "12px sans-serif")
        .selectAll("g")
        .data(obs.slice().reverse())
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legend.append("rect")
        .attr("x", -19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", (d, i) => colorScale(i));

    legend.append("text")
        .attr("x", -24)
        .attr("y", 9.5)
        .attr("dy", "0.35em")
        .text(d => d);

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2) + 5)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
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