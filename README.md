# Scam Surface Mapper

**Advanced bookmarklet for OSINT fraud investigations and cybersecurity research**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![JavaScript](https://img.shields.io/badge/language-JavaScript-yellow.svg)
![Browser](https://img.shields.io/badge/platform-Browser-green.svg)

## 📋 Overview

**Scam Surface Mapper** is a browser bookmarklet designed for OSINT investigators, fact-checkers, and cybersecurity researchers. It analyzes web pages to identify and visualize potential scam infrastructure by mapping outgoing links, analyzing suspicious domains, tracking parameters, and presenting findings in an interactive graph interface.

<img src="https://github.com/user-attachments/assets/7cdfd661-a825-44d1-a274-8fc614add076" />

## 🚀 Installation

### Copy Minified Bookmarklet

1. **Copy the minified code**: Open [`scam-surface-mapper.min.js`](scam-surface-mapper.min.js) and copy the entire content
2. **Create bookmark**
3. **Paste code**: Set the URL field to the copied JavaScript code
4. **Name it**: Set name to "Scam Surface Mapper"
5. **Save bookmark**

## 📖 Usage

### Basic Usage
1. **Navigate** to any suspicious webpage you want to analyze
2. **Click** the "Scam Surface Mapper" bookmark
3. **Explore** the analysis in the overlay interface

### Interface Guide

#### **Tabs**
- **Summary**: Risk-ordered list of discovered hosts with detailed metrics
- **Raw Links**: Complete list of all discovered URLs with analysis
- **Graph**: Interactive visualization of host relationships

#### **Actions Panel**
- **Copy JSON**: Copy complete analysis data to clipboard
- **Download CSV**: Export host and link data as CSV files  
- **Download JSON**: Save complete analysis as JSON file
- **Save PNG**: Export graph visualization as image
- **Fullscreen**: Toggle fullscreen mode for better visibility
- **Close**: Close the analysis overlay

#### **Graph Interaction**
- **Drag nodes**: Click and drag to reposition graph elements
- **Right-click nodes**: Open context menu for OSINT actions

### OSINT Workflow Example

1. **Initial Analysis**: Run bookmarklet on suspicious landing page
2. **Risk Assessment**: Review summary tab for high-scoring domains
3. **Domain Investigation**: Right-click high-risk domains → SecurityTrails/urlscan.io
4. **Data Export**: Download JSON/CSV for further analysis or reporting
5. **Documentation**: Save graph PNG for investigation reports

## 🎯 Use Cases

### **Fraud Investigation**
- Mapping affiliate networks and redirect chains
- Identifying scam infrastructure clusters  
- Tracking UTM campaign parameters
- Documenting fraudulent website relationships

### **Threat Intelligence**
- Analyzing phishing page infrastructure
- Identifying malicious redirect networks
- Mapping cryptocurrency scam operations
- Tracking affiliate marketing fraud

### **Academic Research**
- Studying online fraud ecosystem structures
- Analyzing social engineering campaign infrastructure
- Researching digital manipulation techniques

## ⚠️ Security & Ethics

### **Legitimate Use Only**
This tool is designed for:
- ✅ Cybersecurity research and analysis
- ✅ OSINT investigations by authorized professionals  
- ✅ Academic research on digital fraud
- ✅ Fact-checking and journalism
- ✅ Personal security awareness

### **Privacy Considerations**
- Tool operates entirely client-side (no data transmitted)
- Only analyzes publicly visible page content
- Exports contain URLs and metadata from the analyzed page
- No tracking or data collection by the tool itself

### **Responsible Disclosure**
When using this tool for security research:
- Follow responsible disclosure practices
- Respect website terms of service
- Use only on sites you own or have permission to analyze
- Consider legal implications in your jurisdiction
