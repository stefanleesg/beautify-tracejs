;(function () {

    let SEPARTE_CHAR = "•";
    let MORE_CHAR = "…";
    let DASH_CHAR = "─";
    let ERROR_FILE_NOT_FOUND = "ENOENT";
    let NOOP = function() {};
    let DEFAULT_COLLAB_LIB_REGEX = /node_modules/;

    function repeatStr(str, num) {
        return new Array(num).join(str) + str;
    }

    function BeautifyTraceJS(error, frames, opt) {

        this._outCache = null;
        this._fileCache = {};

        opt = opt || {
            "before": 3,
            "after": 3,
            "libs": /node_modules/,
            "maxColumns": 80,
            "indent": 4,
            "gutter": " » "

        }

        this._collapseLibraries = opt.libs;
        this._linesBefore = opt.before;
        this._linesAfter = opt.after;
        this._maxColumns = opt.maxColumns;
        this._outputPrefix = repeatStr(" ", opt.indent);
        this._gutterContent = opt.gutter;

        var req = opt.require || (typeof require === "undefined" ? NOOP : require);
        var win = opt.window || (typeof window === "undefined" ? {} : window);
        this._fs = opt.fs || req("fs") || win.fs;
    }

    BeautifyTraceJS.prototype = {

        prepareStackTrace: function prepareStackTrace(error, frames) {
            this._outCache = this._outCache || this._format(error, frames);
            return this._outCache;
        },

        _shouldCollapse: function _shouldCollapse(fileName) {
            if (this._collapseLibraries) {
                if (this._collapseLibraries.test) {
                    return this._collapseLibraries.test(fileName);
                } else {
                    return DEFAULT_COLLAB_LIB_REGEX.test(fileName);
                }
            } else {
                return false;
            }
        },

        _readCode: function _readCode(fileName) {
            let code = this._fileCache[fileName];
            if (!code) {
                code = this._fs.readFileSync(fileName).toString();
                this._fileCache[fileName] = code;
            }
            return code;
        },

        _formatCodeLine: function _formatCodeLine(lineNumber, line, maxLineNumber) {
            let pad = maxLineNumber.toString().length - lineNumber.toString().length;
            let padding = "";
            while (pad-- > 0) {
                padding += " ";
            }
            if (line.length > this._maxColumns) {
                line = line.slice(0, this._maxColumns - 1) + MORE_CHAR;
            }
            return padding + lineNumber + this._gutterContent + line;
        },

        _formatCodeArrow: function _formatCodeArrow(lineNumber, columnNumber, maxLineNumber) {
            let length = (this._gutterContent + maxLineNumber).length + columnNumber;
            return repeatStr(SEPARTE_CHAR, length);
        },

        _formatContext: function _formatContext(fileName, lineNumber, columnNumber) {
            let code = "";
            try {
                code = this._readCode(fileName);
            } catch(err) {
                if (err.code === ERROR_FILE_NOT_FOUND) {
                    throw err;
                }
                return this._outputPrefix + err.toString();
            }

            // Figure out the lines of context before and after.
            let lines = code.split("\n");
            let preLines = lines.slice(lineNumber - this._linesBefore - 1, lineNumber);
            let postLines = lines.slice(lineNumber, lineNumber + this._linesAfter);

            // Collect formatted versions of all the lines. Render
            let formattedLines = [];
            let maxLineNumber = lineNumber + this._linesAfter;
            let currentLineNumber = lineNumber - this._linesBefore;
            function renderLines(lines) {
                while (lines.length) {
                    formattedLines.push(this._formatCodeLine(
                        currentLineNumber++,
                        lines.shift(),
                        maxLineNumber
                    ));
                }
            }
            renderLines.call(this, preLines);
            formattedLines.push(this._formatCodeArrow(
                currentLineNumber - 1,
                columnNumber,
                maxLineNumber
            ));
            renderLines.call(this, postLines);

            return this._outputPrefix + formattedLines.join("\n" + this._outputPrefix);
        },

        _format: function _format(error, frames) {
            let lines = [];
            try {
                lines.push(error.toString());
            } catch (e) {
                try {
                    lines.push("<error: " + e + ">");
                } catch (ee) {
                    lines.push("<error>");
                }
            }
            for (let i = 0; i < frames.length; i++) {
                let frame = frames[i];
                let line;
                try {
                    line = this._formatFrame(frame);
                } catch (e) {
                    try {
                        line = "<error: " + e + ">";
                    } catch (ee) {
                        // Any code that reaches this point is seriously nasty!
                        line = "<error>";
                    }
                }
                lines.push(line);
            }
            return lines.join("\n");
        },

        _formatFrame: function _formatFrame(frame) {
            let fileLocation = "";
            let context = null;
            if (frame.isNative()) {
                fileLocation = "native";
            } else if (frame.isEval()) {
                fileLocation = "eval at " + frame.getEvalOrigin();
            } else {
                let fileName = frame.getFileName();
                if (fileName) {
                    fileLocation += fileName;
                    let lineNumber = frame.getLineNumber();
                    if (lineNumber != null) {
                        fileLocation += ":" + lineNumber;
                        let columnNumber = frame.getColumnNumber();
                        if (columnNumber) {
                            fileLocation += ":" + columnNumber;
                        }
                        try {
                            if (this._shouldCollapse(fileName)) {
                                context = null;
                            } else {
                                context = this._formatContext(fileName, lineNumber, columnNumber);
                            }
                        } catch(err) {
                            if (err.code === ERROR_FILE_NOT_FOUND) {
                                context = null;
                            } else {
                                context = err;
                            }
                        }
                    }
                }
            }
            if (!fileLocation) {
                fileLocation = "unknown source";
            }
            let line = "";
            let functionFrame = frame.getFunction()
            let functionName = functionFrame !== undefined ? functionFrame.name : "";

            let methodName = frame.getMethodName();
            let addPrefix = true;
            let isConstructor = frame.isConstructor();
            let isMethodCall = !(frame.isToplevel() || isConstructor);
            if (isMethodCall) {
                line += frame.getTypeName() + ".";
                if (functionName) {
                    line += functionName;
                    if (methodName && (methodName != functionName)) {
                        line += " [as " + methodName + "]";
                    }
                } else {
                    line += methodName || "<anonymous>";
                }
            } else if (isConstructor) {
                line += "new " + (functionName || "<anonymous>");
            } else if (functionName) {
                line += functionName;
            } else {
                line += fileLocation;
                addPrefix = false;
            }
            if (addPrefix) {
                line += " (" + fileLocation + ")";
            }
            line = "at " + line;
            if (context) {
                let underline = this._outputPrefix + line.replace(/./g, DASH_CHAR);
                let betterLine = [line, underline, context].join("\n");
                return this._outputPrefix + betterLine + "\n";
            } else {
                return this._outputPrefix + line;
            }
        }

    };

    let installations = [];

    function register(callback) {
        if (typeof callback !== "function") {
            let options = callback;
            callback = function(error, frames) {
                return new BeautifyTraceJS(options).prepareStackTrace(error, frames);
            };
        }
        if (Error.prepareStackTrace) {
            installations.push(Error.prepareStackTrace)
        }
        Error.prepareStackTrace = callback;
    }

    function unregister() {
        if (Error.prepareStackTrace) {
            delete Error.prepareStackTrace;
        }
        if (installations.length) {
            Error.prepareStackTrace = installations.pop();
        }
    }

    // Export for browser and node.
    let exp = typeof exports === "undefined" ? (this.BeautifyTraceJS = {}) : exports;
    exp.register = register;
    exp.unregister = unregister;
    exp.BeautifyTraceJS = BeautifyTraceJS;

}).call(this);