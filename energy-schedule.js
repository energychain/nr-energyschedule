// energy-schedule.js
const CorrentlyClient = require('corrently-api');
const appid = "0xb61DD55F0DDA7C17975a82dd18EAeD8C025a64ea";
module.exports = function(RED) {
    function EnergyScheduleNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        
        // Store configuration
        node.zip = config.zip;
        node.law = config.law || 'comfort';
        node.coverageHours = parseInt(config.coverageHours) || 24;
        node.activeHours = parseInt(config.activeHours) || 1;
        node.consecutiveHours = config.consecutiveHours !== false; // default to true

        // Initialize context store
        const contextStore = node.context();

        let clientConfig = {
            appid:appid,
            deviceid:"tz1"
        }

        let token = this.context().global.get("corrently-token");
        if((typeof config.personaltoken !== 'undefined') && (config.personaltoken !== null) && (config.personaltoken.length > 1)) {
            token = config.personaltoken;
        }
        if((typeof token !== 'undefined')&&(token !== null)) {
            clientConfig.token = token;
        }
        // Initialize Corrently client
        const client = new CorrentlyClient(clientConfig);
        this.context().global.set("corrently-token",client.token);

        let currentSchedule = null;
        let checkInterval = null;

        // Function to update node status
        function updateNodeStatus(schedule, isOn) {
            if (!schedule) {
                node.status({fill: "gray", shape: "ring", text: "No schedule"});
                return;
            }

            const nextSwitch = findNextSwitchTime(schedule);
            if (isOn) {
                node.status({
                    fill: "green",
                    shape: "dot",
                    text: `ON until ${nextSwitch.toLocaleTimeString()}`
                });
            } else {
                node.status({
                    fill: "red",
                    shape: "ring",
                    text: `OFF until ${nextSwitch.toLocaleTimeString()}`
                });
            }
        }

        // Function to find next switch time
        function findNextSwitchTime(schedule) {
            const now = new Date();
            const activeSlots = schedule.timeSlots || [];
            
            for (const slot of activeSlots) {
                const startTime = new Date(slot.startTime);
                const endTime = new Date(slot.endTime);
                
                if (now >= startTime && now < endTime) {
                    return endTime;
                } else if (now < startTime) {
                    return startTime;
                }
            }
            
            return new Date(activeSlots[0]?.startTime || now);
        }

        // Function to check if current time is within an active slot
        function isCurrentlyActive(schedule) {
            if (!schedule || !schedule.timeSlots) return false;
            
            const now = new Date();
            return schedule.timeSlots.some(slot => {
                const startTime = new Date(slot.startTime);
                const endTime = new Date(slot.endTime);
                return now >= startTime && now < endTime;
            });
        }

        // Function to create or update schedule
        async function handleSchedule(requirements) {
            try {
                // Merge configured values with payload, allowing payload to override
                const mergedRequirements = {
                    zip: requirements.zip || node.zip,
                    coverageHours: requirements.coverageHours || node.coverageHours,
                    requirements: {
                        law: requirements.requirements?.law || node.law,
                        activeHours: requirements.requirements?.activeHours || node.activeHours,
                        consecutiveHours: requirements.requirements?.consecutiveHours !== undefined ? 
                            requirements.requirements.consecutiveHours : node.consecutiveHours,
                        ...requirements.requirements
                    }
                };

                let scheduleId = contextStore.get('scheduleId');
                
                // Try to fetch existing schedule if we have an ID
                if (scheduleId) {
                    try {
                        currentSchedule = await client.schedule.getSchedule(scheduleId);
                    } catch (error) {
                        // If schedule not found or expired, clear the stored ID
                        contextStore.set('scheduleId', null);
                        currentSchedule = null;
                    }
                }

                if (!currentSchedule || currentSchedule.progress?.completionPercentage === 100) {
                    // Create new schedule if none exists or current is completed
                    const newSchedule = await client.schedule.createSchedule(mergedRequirements);
                    
                    // Store the new schedule ID
                    contextStore.set('scheduleId', newSchedule.scheduleId);
                    
                    // Get full schedule details
                    currentSchedule = await client.schedule.getSchedule(newSchedule.scheduleId);
                }

                const isOn = isCurrentlyActive(currentSchedule);
                updateNodeStatus(currentSchedule, isOn);

                // Send outputs
                node.send([
                    { payload: isOn },
                    { payload: currentSchedule }
                ]);

            } catch (error) {
                node.error(`Schedule error: ${error.message}`);
                node.status({fill: "red", shape: "dot", text: "Error"});
                // Clear stored schedule ID on error
                contextStore.set('scheduleId', null);
            }
        }

        // Handle incoming messages
        node.on('input', async function(msg) {
            const requirements = msg.payload || {};
            await handleSchedule(requirements);
        });

        // Set up periodic status check (every minute)
        checkInterval = setInterval(async () => {
            if (currentSchedule) {
                const isOn = isCurrentlyActive(currentSchedule);
                updateNodeStatus(currentSchedule, isOn);
                node.send([
                    { payload: isOn },
                    { payload: currentSchedule }
                ]);
            }
        }, 60000);

        // Cleanup on node removal
        node.on('close', function() {
            if (checkInterval) {
                clearInterval(checkInterval);
            }
        });
    }

    RED.nodes.registerType("energy-schedule", EnergyScheduleNode);
}