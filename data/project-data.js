window.PROJECT_DATA = {
  "meta": {
    "title": "San Francisco Crime Analysis",
    "subtitle": "A Spark SQL case study turning large public safety records into recruiter-readable analytical evidence.",
    "sourcePath": "C:\\Users\\94903\\Desktop\\L\\SF-Crime\\SF_crime.ipynb",
    "notebook": "SF_crime.ipynb",
    "projectFolder": "C:\\Users\\94903\\Desktop\\L\\SF-Crime",
    "dateRange": "Historical incidents, 2003 to May 2018; trend focus on 2015-2018",
    "generatedAt": "Generated from notebook outputs",
    "tools": [
      "Python",
      "PySpark",
      "Spark SQL",
      "Pandas",
      "Matplotlib",
      "Notebook analysis"
    ]
  },
  "story": {
    "problem": "Explore San Francisco incident records at city scale and identify patterns that can support travel guidance and police resource allocation.",
    "approach": "Load the raw CSV with Spark, register a SQL view, aggregate by category, district, month, and hour, then convert selected results to Pandas for visualization.",
    "outcome": "The analysis surfaces concentrated district risk, dominant theft-related categories, seasonal trend comparisons, and hourly peaks useful for operational recommendations."
  },
  "workflow": [
    {
      "title": "Spark ingestion",
      "detail": "Initialize a SparkSession and infer schema from the incident CSV without copying the source data into the web artifact."
    },
    {
      "title": "SQL-first aggregation",
      "detail": "Register the DataFrame as sf_crime and use Spark SQL to compute category, district, month, and hour summaries."
    },
    {
      "title": "Visualization handoff",
      "detail": "Convert compact aggregate outputs to chart-ready arrays for browser rendering."
    },
    {
      "title": "Decision framing",
      "detail": "Translate raw counts into recruiter-friendly findings about risk concentration, timing, and operational action."
    }
  ],
  "findings": {
    "categories": {
      "title": "Top Crime Categories",
      "summary": "Larceny/theft is the largest category in the extracted top-ten output, followed by other offenses and non-criminal records.",
      "xKey": "category",
      "yKey": "Count",
      "data": [
        {
          "category": "LARCENY/THEFT",
          "Count": 477975
        },
        {
          "category": "OTHER OFFENSES",
          "Count": 301874
        },
        {
          "category": "NON-CRIMINAL",
          "Count": 179139
        },
        {
          "category": "ASSAULT",
          "Count": 167042
        },
        {
          "category": "VEHICLE THEFT",
          "Count": 126228
        },
        {
          "category": "DRUG/NARCOTIC",
          "Count": 117821
        },
        {
          "category": "VANDALISM",
          "Count": 114718
        },
        {
          "category": "WARRANTS",
          "Count": 99821
        },
        {
          "category": "BURGLARY",
          "Count": 91067
        },
        {
          "category": "SUSPICIOUS OCC",
          "Count": 79087
        }
      ]
    },
    "districts": {
      "title": "District Concentration",
      "summary": "Southern, Mission, and Northern districts have the highest incident counts in the notebook output.",
      "xKey": "PdDistrict",
      "yKey": "Count",
      "data": [
        {
          "PdDistrict": "SOUTHERN",
          "Count": 378453
        },
        {
          "PdDistrict": "MISSION",
          "Count": 279744
        },
        {
          "PdDistrict": "NORTHERN",
          "Count": 260013
        },
        {
          "PdDistrict": "CENTRAL",
          "Count": 216646
        },
        {
          "PdDistrict": "BAYVIEW",
          "Count": 201989
        },
        {
          "PdDistrict": "TENDERLOIN",
          "Count": 180934
        },
        {
          "PdDistrict": "INGLESIDE",
          "Count": 176557
        },
        {
          "PdDistrict": "TARAVAL",
          "Count": 150970
        },
        {
          "PdDistrict": "PARK",
          "Count": 116296
        },
        {
          "PdDistrict": "RICHMOND",
          "Count": 110133
        }
      ]
    },
    "monthly": {
      "title": "Monthly Trend, 2015-2018",
      "summary": "The month-by-year table enables comparison across recent complete years before the dataset cutoff.",
      "xKey": "Month",
      "seriesKey": "Year",
      "yKey": "Count",
      "data": [
        {
          "Month": 1,
          "Year": 2015,
          "Count": 12781
        },
        {
          "Month": 2,
          "Year": 2015,
          "Count": 11504
        },
        {
          "Month": 3,
          "Year": 2015,
          "Count": 13037
        },
        {
          "Month": 4,
          "Year": 2015,
          "Count": 12125
        },
        {
          "Month": 5,
          "Year": 2015,
          "Count": 12893
        },
        {
          "Month": 6,
          "Year": 2015,
          "Count": 12490
        },
        {
          "Month": 7,
          "Year": 2015,
          "Count": 12598
        },
        {
          "Month": 8,
          "Year": 2015,
          "Count": 12875
        },
        {
          "Month": 9,
          "Year": 2015,
          "Count": 12042
        },
        {
          "Month": 10,
          "Year": 2015,
          "Count": 12282
        },
        {
          "Month": 11,
          "Year": 2015,
          "Count": 11299
        },
        {
          "Month": 12,
          "Year": 2015,
          "Count": 10749
        },
        {
          "Month": 1,
          "Year": 2016,
          "Count": 12154
        },
        {
          "Month": 2,
          "Year": 2016,
          "Count": 11394
        },
        {
          "Month": 3,
          "Year": 2016,
          "Count": 11547
        },
        {
          "Month": 4,
          "Year": 2016,
          "Count": 11486
        },
        {
          "Month": 5,
          "Year": 2016,
          "Count": 11916
        },
        {
          "Month": 6,
          "Year": 2016,
          "Count": 11305
        },
        {
          "Month": 7,
          "Year": 2016,
          "Count": 11436
        },
        {
          "Month": 8,
          "Year": 2016,
          "Count": 11747
        },
        {
          "Month": 9,
          "Year": 2016,
          "Count": 11696
        },
        {
          "Month": 10,
          "Year": 2016,
          "Count": 12548
        },
        {
          "Month": 11,
          "Year": 2016,
          "Count": 11891
        },
        {
          "Month": 12,
          "Year": 2016,
          "Count": 12225
        },
        {
          "Month": 1,
          "Year": 2017,
          "Count": 12314
        },
        {
          "Month": 2,
          "Year": 2017,
          "Count": 11398
        },
        {
          "Month": 3,
          "Year": 2017,
          "Count": 12827
        },
        {
          "Month": 4,
          "Year": 2017,
          "Count": 12092
        },
        {
          "Month": 5,
          "Year": 2017,
          "Count": 12378
        },
        {
          "Month": 6,
          "Year": 2017,
          "Count": 11795
        },
        {
          "Month": 7,
          "Year": 2017,
          "Count": 12363
        },
        {
          "Month": 8,
          "Year": 2017,
          "Count": 12028
        },
        {
          "Month": 9,
          "Year": 2017,
          "Count": 11819
        },
        {
          "Month": 10,
          "Year": 2017,
          "Count": 12630
        },
        {
          "Month": 11,
          "Year": 2017,
          "Count": 11609
        },
        {
          "Month": 12,
          "Year": 2017,
          "Count": 11772
        },
        {
          "Month": 1,
          "Year": 2018,
          "Count": 11320
        },
        {
          "Month": 2,
          "Year": 2018,
          "Count": 9287
        },
        {
          "Month": 3,
          "Year": 2018,
          "Count": 10042
        },
        {
          "Month": 4,
          "Year": 2018,
          "Count": 9679
        },
        {
          "Month": 5,
          "Year": 2018,
          "Count": 3405
        }
      ]
    },
    "hourly": {
      "title": "Hourly Distribution",
      "summary": "Incident volume rises through the day and peaks around early evening, supporting practical travel-safety discussion.",
      "xKey": "Hour",
      "yKey": "Count",
      "data": [
        {
          "Hour": 0,
          "Count": 106869
        },
        {
          "Hour": 1,
          "Count": 61748
        },
        {
          "Hour": 2,
          "Count": 51521
        },
        {
          "Hour": 3,
          "Count": 33314
        },
        {
          "Hour": 4,
          "Count": 23545
        },
        {
          "Hour": 5,
          "Count": 20976
        },
        {
          "Hour": 6,
          "Count": 31125
        },
        {
          "Hour": 7,
          "Count": 50654
        },
        {
          "Hour": 8,
          "Count": 76123
        },
        {
          "Hour": 9,
          "Count": 82997
        },
        {
          "Hour": 10,
          "Count": 88627
        },
        {
          "Hour": 11,
          "Count": 90390
        },
        {
          "Hour": 12,
          "Count": 124433
        },
        {
          "Hour": 13,
          "Count": 101000
        },
        {
          "Hour": 14,
          "Count": 104636
        },
        {
          "Hour": 15,
          "Count": 111500
        },
        {
          "Hour": 16,
          "Count": 117074
        },
        {
          "Hour": 17,
          "Count": 126960
        },
        {
          "Hour": 18,
          "Count": 132503
        },
        {
          "Hour": 19,
          "Count": 118831
        },
        {
          "Hour": 20,
          "Count": 107790
        },
        {
          "Hour": 21,
          "Count": 102603
        },
        {
          "Hour": 22,
          "Count": 107297
        },
        {
          "Hour": 23,
          "Count": 99220
        }
      ]
    }
  },
  "skills": [
    "Large-file ingestion with Spark",
    "Spark SQL aggregation and grouping",
    "Schema inspection and feature selection",
    "Notebook-to-web data extraction",
    "Data storytelling for non-technical review"
  ],
  "evidence": {
    "questions": [
      {
        "id": "Q1",
        "prompt": "Write a spark programme to count the crimes of different cates \u591a\u5c11\u62a2\u52ab\uff1f\u591a\u5c11\u5077\u8f66\uff1f\u7b49\u7b49"
      },
      {
        "id": "Q2",
        "prompt": "Count the number of crimes for differnet district and visualization"
      },
      {
        "id": "Q3",
        "prompt": "\uff1a Count the number of crimes each \"Sunday\" @ SF downtown hint1: downtown \u7ecf\u7eac\u5ea6\u5b9a\u4e49"
      },
      {
        "id": "Q4",
        "prompt": "Analysis number of crimes in each month of 2015,2016,2017,2018. Then give your insights of the output results. What is the business impact for your result"
      },
      {
        "id": "Q5",
        "prompt": "Analysis the number of crime with respsect to the hour in certian day like 2015/12/15, 2016/12/15, 2017/12/15. Then, give your travel suggestion to visit SF."
      },
      {
        "id": "Q6",
        "prompt": "question (1) Step1: Find out the top-3 danger disrict \u5b9a\u4e49\u4ec0\u4e48\u53ebdanger\uff1f (2) Step2: find out the crime event w.r.t category and time (hour) from the result of step 1 (3) give your advice to distribute the police based on your analysis results."
      }
    ],
    "schema": [
      "root",
      " |-- PdId: long (nullable = true)",
      " |-- IncidntNum: integer (nullable = true)",
      " |-- Incident Code: integer (nullable = true)",
      " |-- Category: string (nullable = true)",
      " |-- Descript: string (nullable = true)",
      " |-- DayOfWeek: string (nullable = true)",
      " |-- Date: string (nullable = true)",
      " |-- Time: timestamp (nullable = true)",
      " |-- PdDistrict: string (nullable = true)",
      " |-- Resolution: string (nullable = true)",
      " |-- Address: string (nullable = true)",
      " |-- X: double (nullable = true)",
      " |-- Y: double (nullable = true)",
      " |-- location: string (nullable = true)",
      " |-- data_loaded_at: string (nullable = true)",
      "",
      "+--------------+----------+-------------+-------------+-----------------+---------+----------+-------------------+----------+----------+--------------------+----------------+--------------+--------------------+--------------------+",
      "|          PdId|IncidntNum|Incident Code|     Category|         Descript|DayOfWeek|      Date|               Time|PdDistrict|Resolution|             Address|               X|             Y|            location|      data_loaded_at|",
      "+--------------+----------+-------------+-------------+-----------------+---------+----------+-------------------+----------+----------+--------------------+----------------+--------------+--------------------+--------------------+",
      "|16020415607021| 160204156|         7021|VEHICLE THEFT|STOLEN AUTOMOBILE| Thursday|03/03/2016|2026-01-04 19:30:00|   TARAVAL|      NONE|100 Block of BEPL...|-122.46354501682|37.70796836451|POINT (-122.46354...|2025/06/20 12:17:...|",
      "|11049313327195| 110493133|        27195|     TRESPASS|      TRESPASSING|   Sunday|06/19/2011|2026-01-04 13:06:00|   TARAVAL|      NONE|100 Block of APTO...|-122.46675800516| 37.7291845796|POINT (-122.46675...|2025/06/20 12:17:...|"
    ],
    "rawTables": {
      "category": [
        {
          "category": "LARCENY/THEFT",
          "Count": 477975
        },
        {
          "category": "OTHER OFFENSES",
          "Count": 301874
        },
        {
          "category": "NON-CRIMINAL",
          "Count": 179139
        },
        {
          "category": "ASSAULT",
          "Count": 167042
        },
        {
          "category": "VEHICLE THEFT",
          "Count": 126228
        },
        {
          "category": "DRUG/NARCOTIC",
          "Count": 117821
        },
        {
          "category": "VANDALISM",
          "Count": 114718
        },
        {
          "category": "WARRANTS",
          "Count": 99821
        },
        {
          "category": "BURGLARY",
          "Count": 91067
        },
        {
          "category": "SUSPICIOUS OCC",
          "Count": 79087
        }
      ],
      "district": [
        {
          "PdDistrict": "SOUTHERN",
          "Count": 378453
        },
        {
          "PdDistrict": "MISSION",
          "Count": 279744
        },
        {
          "PdDistrict": "NORTHERN",
          "Count": 260013
        },
        {
          "PdDistrict": "CENTRAL",
          "Count": 216646
        },
        {
          "PdDistrict": "BAYVIEW",
          "Count": 201989
        },
        {
          "PdDistrict": "TENDERLOIN",
          "Count": 180934
        },
        {
          "PdDistrict": "INGLESIDE",
          "Count": 176557
        },
        {
          "PdDistrict": "TARAVAL",
          "Count": 150970
        },
        {
          "PdDistrict": "PARK",
          "Count": 116296
        },
        {
          "PdDistrict": "RICHMOND",
          "Count": 110133
        },
        {
          "PdDistrict": "NA",
          "Count": 1
        }
      ],
      "monthly": [
        {
          "Month": 1,
          "Year": 2015,
          "Count": 12781
        },
        {
          "Month": 2,
          "Year": 2015,
          "Count": 11504
        },
        {
          "Month": 3,
          "Year": 2015,
          "Count": 13037
        },
        {
          "Month": 4,
          "Year": 2015,
          "Count": 12125
        },
        {
          "Month": 5,
          "Year": 2015,
          "Count": 12893
        },
        {
          "Month": 6,
          "Year": 2015,
          "Count": 12490
        },
        {
          "Month": 7,
          "Year": 2015,
          "Count": 12598
        },
        {
          "Month": 8,
          "Year": 2015,
          "Count": 12875
        },
        {
          "Month": 9,
          "Year": 2015,
          "Count": 12042
        },
        {
          "Month": 10,
          "Year": 2015,
          "Count": 12282
        },
        {
          "Month": 11,
          "Year": 2015,
          "Count": 11299
        },
        {
          "Month": 12,
          "Year": 2015,
          "Count": 10749
        },
        {
          "Month": 1,
          "Year": 2016,
          "Count": 12154
        },
        {
          "Month": 2,
          "Year": 2016,
          "Count": 11394
        },
        {
          "Month": 3,
          "Year": 2016,
          "Count": 11547
        },
        {
          "Month": 4,
          "Year": 2016,
          "Count": 11486
        },
        {
          "Month": 5,
          "Year": 2016,
          "Count": 11916
        },
        {
          "Month": 6,
          "Year": 2016,
          "Count": 11305
        },
        {
          "Month": 7,
          "Year": 2016,
          "Count": 11436
        },
        {
          "Month": 8,
          "Year": 2016,
          "Count": 11747
        },
        {
          "Month": 9,
          "Year": 2016,
          "Count": 11696
        },
        {
          "Month": 10,
          "Year": 2016,
          "Count": 12548
        },
        {
          "Month": 11,
          "Year": 2016,
          "Count": 11891
        },
        {
          "Month": 12,
          "Year": 2016,
          "Count": 12225
        },
        {
          "Month": 1,
          "Year": 2017,
          "Count": 12314
        },
        {
          "Month": 2,
          "Year": 2017,
          "Count": 11398
        },
        {
          "Month": 3,
          "Year": 2017,
          "Count": 12827
        },
        {
          "Month": 4,
          "Year": 2017,
          "Count": 12092
        },
        {
          "Month": 5,
          "Year": 2017,
          "Count": 12378
        },
        {
          "Month": 6,
          "Year": 2017,
          "Count": 11795
        },
        {
          "Month": 7,
          "Year": 2017,
          "Count": 12363
        },
        {
          "Month": 8,
          "Year": 2017,
          "Count": 12028
        },
        {
          "Month": 9,
          "Year": 2017,
          "Count": 11819
        },
        {
          "Month": 10,
          "Year": 2017,
          "Count": 12630
        },
        {
          "Month": 11,
          "Year": 2017,
          "Count": 11609
        },
        {
          "Month": 12,
          "Year": 2017,
          "Count": 11772
        },
        {
          "Month": 1,
          "Year": 2018,
          "Count": 11320
        },
        {
          "Month": 2,
          "Year": 2018,
          "Count": 9287
        },
        {
          "Month": 3,
          "Year": 2018,
          "Count": 10042
        },
        {
          "Month": 4,
          "Year": 2018,
          "Count": 9679
        },
        {
          "Month": 5,
          "Year": 2018,
          "Count": 3405
        }
      ],
      "hourly": [
        {
          "Hour": 0,
          "Count": 106869
        },
        {
          "Hour": 1,
          "Count": 61748
        },
        {
          "Hour": 2,
          "Count": 51521
        },
        {
          "Hour": 3,
          "Count": 33314
        },
        {
          "Hour": 4,
          "Count": 23545
        },
        {
          "Hour": 5,
          "Count": 20976
        },
        {
          "Hour": 6,
          "Count": 31125
        },
        {
          "Hour": 7,
          "Count": 50654
        },
        {
          "Hour": 8,
          "Count": 76123
        },
        {
          "Hour": 9,
          "Count": 82997
        },
        {
          "Hour": 10,
          "Count": 88627
        },
        {
          "Hour": 11,
          "Count": 90390
        },
        {
          "Hour": 12,
          "Count": 124433
        },
        {
          "Hour": 13,
          "Count": 101000
        },
        {
          "Hour": 14,
          "Count": 104636
        },
        {
          "Hour": 15,
          "Count": 111500
        },
        {
          "Hour": 16,
          "Count": 117074
        },
        {
          "Hour": 17,
          "Count": 126960
        },
        {
          "Hour": 18,
          "Count": 132503
        },
        {
          "Hour": 19,
          "Count": 118831
        },
        {
          "Hour": 20,
          "Count": 107790
        },
        {
          "Hour": 21,
          "Count": 102603
        },
        {
          "Hour": 22,
          "Count": 107297
        },
        {
          "Hour": 23,
          "Count": 99220
        }
      ]
    }
  },
  "limits": [
    "This page uses aggregate notebook outputs, not the full source CSV.",
    "Counts are descriptive and should not be read as causal claims.",
    "Notebook text includes a few encoding artifacts; the showcase cleans only visible labels needed for presentation."
  ]
};
