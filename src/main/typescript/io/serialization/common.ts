export function formatXml(xml: string, tab: string = "\t") {
    let formatted = ""
    let indent = ""
    xml.split(/>\s*</).forEach(node => {
        if (node.match(/^\/\w/)) {
            indent = indent.substring(tab.length)
        }
        formatted += indent + "<" + node + ">\r\n"
        if (node.match(/^<?\w[^>]*[^/]$/)) {
            indent += tab
        }
    })
    return formatted.substring(1, formatted.length - 3)
}

export const addHeader: (spec: string) => string = (spec) =>
    formatXml(
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
        "<?xml-stylesheet href=\"os.xsl\" type=\"text/xsl\" ?>" + 
        "<organisational-specification id=\"joj\" os-version=\"0.7\"" + "\n" +
                "xmlns='http://moise.sourceforge.net/os'" + "\n" +
                "xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'" + "\n" +
                "xsi:schemaLocation='http://moise.sourceforge.net/os" + "\n" +
                            "http://moise.sourceforge.net/xml/os.xsd'>" + "\n" +
        spec + "\n" +
        "</organisational-specification>"
    )
