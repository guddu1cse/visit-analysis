import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Input, Button, Card, CardContent, Progress } from "./ui";
import { FaUser, FaLock } from 'react-icons/fa';
import axios from "axios";

export default function Login({ setVisits }) {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check for saved credentials in localStorage
        const saved = localStorage.getItem('visitAppCredentials');
        if (saved) {
            try {
                const creds = JSON.parse(saved);
                if (creds.username && creds.password) {
                    setFormData({ username: creds.username, password: creds.password });
                    // Attempt auto-login
                    handleSubmit({ preventDefault: () => {} }, creds);
                }
            } catch (e) {
                
            }
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validate = useMemo(
        () => ({
            username: formData.username.length >= 3,
            password: formData.password.trim().length >= 3,
        }),
        [formData]
    );

    const isFormValid = Object.values(validate).every(Boolean);
    const completion =
        (Object.values(validate).filter(Boolean).length /
            Object.keys(validate).length) *
        100;

    const handleSubmit = async (e, overrideData = null) => {
        if (e && e.preventDefault) e.preventDefault();
        const dataToUse = overrideData || formData;
        const valid = Object.values({
            username: dataToUse.username.length >= 3,
            password: dataToUse.password.trim().length >= 3,
        }).every(Boolean);
        if (valid) {
            console.log({ ...dataToUse });
            try {
                setIsLoading(true);
                const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/find-visits`, {
                    ...dataToUse
                });
                setVisits(response.data.visits);
                setError('');
                // Save credentials in localStorage
                localStorage.setItem('visitAppCredentials', JSON.stringify({
                    username: dataToUse.username,
                    password: dataToUse.password
                }));
            } catch (err) {
                console.log(err);
                setError('Invalid username or password');
                setVisits(null);
            } finally {
                setIsLoading(false);
            }
        } else {
            setShowValidation(true);
        }
    };

    const fields = [
        { label: "username", name: "username", icon: FaUser },
        { label: "Password", name: "password", icon: FaLock },
    ];


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-2 sm:p-4 md:p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl"></div>
            <Card className="w-[95%] sm:w-[90%] md:w-[85%] lg:w-[70%] xl:w-[60%] max-w-lg p-3 sm:p-4 md:p-6 relative overflow-hidden rounded-2xl shadow-xl bg-white/20 backdrop-blur-xl border border-white/30">
                <Progress value={completion} className="mb-4 h-1 bg-white/20 [&>div]:bg-white/40" />
                <div >
                    <h2 className="text-xl sm:text-2xl md:text-xl font-bold text-center mb-3 sm:mb-4 md:mb-6 text-white">
                        {import.meta.env.VITE_FORM_HEADER}
                    </h2>
                    <form onSubmit={handleSubmit} className=" p-3 space-y-8 sm:space-y-3 md:space-y-8 align-middle">
                        {fields.map((field, i) => (
                            <motion.div
                                key={field.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="relative"
                            >
                                <div className="relative mt-3">
                                    <field.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/90 hover:text-black/80 transition-colors duration-200" />
                                    <Input
                                        type={field.name === "password" ? "password" : "text"}
                                        placeholder={field.label}
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        className={`transition-all focus:ring-0 focus:outline-none rounded-lg pl-10 pr-4 py-2 w-full bg-white/50 blue text-sm sm:text-base
                        ${showValidation && !validate[field.name] && !field.optional
                                                ? "border-red-500"
                                                : "border-transparent bg-gradient-to-r from-indigo-500/50 to-purple-500/50"
                                            }`}
                                    />
                                </div>
                                {showValidation && !validate[field.name] && !field.optional && (
                                    <p className="text-xs sm:text-sm text-red-500 mt-1 italic">
                                        Required Field
                                    </p>
                                )}
                            </motion.div>
                        ))}
                        {completion === 100 && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-white text-sm text-center font-medium mb-2"
                            >
                                ✅ Everything looks perfect. Let's log you in!
                            </motion.p>
                        )}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full mt-3 sm:mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 text-sm sm:text-base focus:outline-none focus:ring-0 ${(isLoading) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            onClick={handleSubmit}
                        >
                            <motion.div
                                animate={isLoading ? { scale: [1, 1.1, 1] } : {}}
                                transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
                            >
                                {isLoading ? 'Logging in...' : 'Log In'}
                            </motion.div>
                        </Button>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-sm mt-2 text-center"
                            >
                                {error}
                            </motion.p>
                        )}
                    </form>
                </div>
            </Card>
        </div>
    );
}
