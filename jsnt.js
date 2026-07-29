class jsnt {
    static #store = {}

    static async parse(data) {
        try {
            if (typeof data == 'string') {
                if (data.startsWith('http')) {
                    const response = await fetch(data)
                    const fileContent = await response.text()
                    return JSON.parse(fileContent)
                }
                return JSON.parse(data)
            }
            if (typeof data == 'object') return data
            throw new Error('Incorrect data for parsing.')
        } catch (error) {
            console.error('Error parsing data:', error)
            return null
        }
    }

    static async get(filename, callback) {
        try {
            if (filename) {
                const content = await jsnt.#readTxt(filename)
                const dataObject = JSON.parse(content)
                callback(dataObject)
            }
        } catch (error) {
            throw new Error('JSNT: ' + error)
        }
    }

    static async download(filename, newContent = null) {
        try {
            if (!newContent) {
                newContent = await jsnt.#readTxt(filename)
            }

            const blob = new Blob([newContent], { type: 'text/plain' })
            const blobUrl = URL.createObjectURL(blob)

            const downloadLink = document.createElement('a')
            downloadLink.href = blobUrl
            downloadLink.download = filename
            downloadLink.click()

            URL.revokeObjectURL(blobUrl)
        } catch (error) {
            console.error(error)
        }
    }

    static async replace(filename, columnName, newValue) {
        try {
            if (filename && columnName && newValue) {
                const content = await jsnt.#readTxt(filename)
                const dataObject = JSON.parse(content)

                dataObject[columnName] = newValue
                return dataObject
            }
            throw new Error('JSNT: Missing parameters for jsnt.replace')
        } catch (error) {
            throw error
        }
    }

    static remove(jsonData, columnName) {
        const data = typeof jsonData == 'string' ? JSON.parse(jsonData) : jsonData
        delete data[columnName]
        return data
    }

    static set(jsonData, key, value) {
        const keys = key.split('.')
        let currentObj = jsonData

        for (let i = 0; i < keys.length - 1; i++) {
            const currentKey = keys[i]
            if (!currentObj[currentKey] || typeof currentObj[currentKey] != 'object') {
                currentObj[currentKey] = {}
            }
            currentObj = currentObj[currentKey]
        }

        currentObj[keys[keys.length - 1]] = value
    }

    static has(jsonData, key) {
        const keys = key.split('.')
        let currentObj = jsonData

        for (const currentKey of keys) {
            if (!currentObj.hasOwnProperty(currentKey)) {
                return false
            }
            currentObj = currentObj[currentKey]
        }

        return true
    }

    static filter(jsonData, condition) {
        return Object.fromEntries(Object.entries(jsonData).filter(([key, value]) => condition(value)))
    }

    static sort(jsonData, key) {
        return Object.fromEntries(Object.entries(jsonData).sort((a, b) => a[1][key] - b[1][key]))
    }

    static merge(...jsonObjects) {
        return Object.assign({}, ...jsonObjects)
    }

    static flatten(jsonData, parentKey = '', flattenedData = {}) {
        Object.keys(jsonData).forEach(key => {
            const newKey = parentKey ? `${parentKey}.${key}` : key
            const value = jsonData[key]

            if (typeof value == 'object' && value != null) {
                jsnt.flatten(value, newKey, flattenedData)
            } else {
                flattenedData[newKey] = value
            }
        })

        return flattenedData
    }

    static validate(jsonData, schema) {
        try {
            JSON.parse(JSON.stringify(jsonData))
            return true
        } catch (error) {
            return false
        }
    }

    static count(jsonData) {
        return Object.keys(jsonData).length
    }

    static keys(jsonData) {
        return Object.keys(jsonData)
    }

    static isEmpty(jsonData) {
        return Object.keys(jsonData).length == 0
    }

    static toString(jsonData) {
        return JSON.stringify(jsonData)
    }

    static toJson(jsonString) {
        return JSON.parse(jsonString)
    }

    static toArray(data) {
        return Object.values(data)
    }

    static sum(data, key) {
        return Object.values(data).reduce((result, item) => result + item[key], 0)
    }

    static equal(obj1, obj2) {
        if (typeof obj1 != typeof obj2) return false
        if (typeof obj1 != 'object' || obj1 == null || obj2 == null) return obj1 == obj2

        if (Array.isArray(obj1)) {
            if (!Array.isArray(obj2) || obj1.length != obj2.length) return false
            return obj1.every((item, index) => jsnt.equal(item, obj2[index]))
        }

        const keys1 = Object.keys(obj1)
        const keys2 = Object.keys(obj2)
        if (keys1.length != keys2.length) return false

        return keys1.every(key => keys2.includes(key) && jsnt.equal(obj1[key], obj2[key]))
    }

    static group(data, key) {
        return data.reduce((result, item) => {
            const groupKey = item[key]
            if (!result[groupKey]) {
                result[groupKey] = []
            }
            result[groupKey].push(item)
            return result
        }, {})
    }

    static renameKey(obj, oldKey, newKey) {
        if (!obj.hasOwnProperty(oldKey)) return obj

        const updatedObj = { ...obj, [newKey]: obj[oldKey] }
        delete updatedObj[oldKey]
        return updatedObj
    }

    static average(data, key) {
        const sum = jsnt.sum(data, key)
        const count = Object.values(data).length
        return sum / count
    }

    static map(obj, callback) {
        if (Array.isArray(obj)) {
            return obj.map(item => jsnt.map(item, callback))
        } else if (typeof obj == 'object') {
            return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, jsnt.map(value, callback)]))
        } else {
            return callback(obj)
        }
    }

    static date = {
        convert(unixDate, format, timeZone = undefined) {
            const date = new Date(unixDate * 1000)
            const options = {
                timeZone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }
            const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date)

            return format
                .replace('DD', formattedDate.slice(3, 5))
                .replace('MM', formattedDate.slice(0, 2))
                .replace('YYYY', formattedDate.slice(6, 10))
                .replace('hh', formattedDate.slice(11, 13))
                .replace('mm', formattedDate.slice(14, 16))
                .replace('ss', formattedDate.slice(17, 19))
        },

        diff(unixDate1, unixDate2, unit = undefined) {
            const difference = Math.abs(unixDate1 - unixDate2) * 1000
            const timeUnits = {
                years: Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25)),
                months: Math.floor(difference / (1000 * 60 * 60 * 24 * 30.44)) % 12,
                days: Math.floor(difference / (1000 * 60 * 60 * 24)) % 30.44,
                hours: Math.floor(difference / (1000 * 60 * 60)) % 24,
                minutes: Math.floor(difference / (1000 * 60)),
                seconds: Math.floor(difference / 1000),
                milliseconds: difference,
            }

            return unit ? timeUnits[unit] : timeUnits
        },

        now() {
            return Math.floor(Date.now() / 1000)
        },

        add(unixDate, { years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0 }) {
            const date = new Date(unixDate * 1000)
            date.setFullYear(date.getFullYear() + years)
            date.setMonth(date.getMonth() + months)
            date.setDate(date.getDate() + days)
            date.setHours(date.getHours() + hours)
            date.setMinutes(date.getMinutes() + minutes)
            date.setSeconds(date.getSeconds() + seconds)
            return Math.floor(date.getTime() / 1000)
        },

        substr(unixDate, { years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0 }) {
            const date = new Date(unixDate * 1000)
            date.setFullYear(date.getFullYear() - years)
            date.setMonth(date.getMonth() - months)
            date.setDate(date.getDate() - days)
            date.setHours(date.getHours() - hours)
            date.setMinutes(date.getMinutes() - minutes)
            date.setSeconds(date.getSeconds() - seconds)
            return Math.floor(date.getTime() / 1000)
        },
    }

    static cache = {
        new(key, value) {
            jsnt.#store[key] = value
        },

        add(key, value) {
            const existingCache = jsnt.#store[key]

            if (typeof existingCache == 'string') {
                const convertedCache = JSON.parse(existingCache)
                Object.assign(convertedCache, value)
                jsnt.#store[key] = JSON.stringify(convertedCache)
            } else if (typeof existingCache == 'object') {
                Object.assign(existingCache, value)
            }
        },

        get(key) {
            return jsnt.#store[key]
        },

        remove(key) {
            delete jsnt.#store[key]
        },

        clear() {
            jsnt.#store = {}
        },
    }

    static parseYAML(yamlString) {
        try {
            const lines = yamlString.split('\n')
            const data = {}

            for (const line of lines) {
                const trimmedLine = line.trim()

                if (trimmedLine.length == 0 || trimmedLine.startsWith('#')) {
                    continue
                }

                const [key, value] = trimmedLine.split(':').map(part => part.trim())
                data[key] = value
            }

            return data
        } catch (error) {
            console.error('YAML parsing error:', error)
            return null
        }
    }

    static toYAML(data) {
        try {
            function convertObjectToYAML(obj, indentLevel = 0) {
                let yamlString = ''

                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        const value = obj[key]
                        const indent = ' '.repeat(indentLevel * 2)

                        if (typeof value == 'object' && value != null && !Array.isArray(value)) {
                            yamlString += `${indent}${key}:\n${convertObjectToYAML(value, indentLevel + 1)}`
                        } else {
                            yamlString += `${indent}${key}: ${value}\n`
                        }
                    }
                }

                return yamlString
            }

            return convertObjectToYAML(data)
        } catch (error) {
            console.error('Error during yaml-to-json conversion:', error)
            return null
        }
    }

    static parseXML(xmlString) {
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
        const rootNode = xmlDoc.documentElement
        const result = {}

        function parseNode(node, obj) {
            if (node.hasChildNodes()) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    const childNode = node.childNodes[i]
                    if (childNode.nodeType == Node.ELEMENT_NODE) {
                        const childObj = {}
                        parseNode(childNode, childObj)
                        if (obj[childNode.nodeName]) {
                            if (!Array.isArray(obj[childNode.nodeName])) {
                                obj[childNode.nodeName] = [obj[childNode.nodeName]]
                            }
                            obj[childNode.nodeName].push(childObj)
                        } else {
                            obj[childNode.nodeName] = childObj
                        }
                    }
                }
            } else {
                obj[node.nodeName] = node.textContent
            }
        }

        parseNode(rootNode, result)
        return result
    }

    static toXML(data) {
        let xmlString = ''

        function createXMLNodes(obj) {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key]

                    if (typeof value == 'object') {
                        xmlString += `<${key}>`
                        createXMLNodes(value)
                        xmlString += `</${key}>`
                    } else {
                        xmlString += `<${key}>${value}</${key}>`
                    }
                }
            }
        }

        xmlString += '<root>'
        createXMLNodes(data)
        xmlString += '</root>'

        return xmlString
    }

    static async #readTxt(linkContent) {
        return await fetch(linkContent)
            .then(result => {
                if (result.ok == true) {
                    return result.text()
                }
                throw new Error('Not 2xx response')
            })
            .catch(error => {
                console.log('JSNT: ' + error)
            })
    }
}
