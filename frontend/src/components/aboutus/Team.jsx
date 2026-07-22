import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import TeamMember from "./Teammember";
import { Backendurl } from "../../utils/backendUrl";
import { Loader } from "lucide-react";

export default function Team() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching teams from:', `${Backendurl}/api/teams/list`);
      
      const response = await axios.get(`${Backendurl}/api/teams/list`, {
        params: {
          isActive: true
        }
      });
      
      console.log('✅ Teams API response:', response.data);
      
      if (response.data.success && response.data.teams) {
        setTeamMembers(response.data.teams);
      } else {
        setError('Failed to load teams');
        setTeamMembers([]);
      }
    } catch (err) {
      console.error('❌ Error fetching teams:', err);
      setError(err.response?.data?.message || 'Failed to load teams');
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </section>
    );
  }

  if (error || teamMembers.length === 0) {
    return (
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">Meet Our Team</h2>
            <div className="w-24 h-1 bg-blue-600 dark:bg-blue-500 mx-auto mb-6"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              {error || "Our team members will be displayed here soon."}
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Meet Our Team</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            The passionate individuals behind NGENZI REALESTATE's success
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id || index}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="transform transition-all duration-300"
            >
              <TeamMember 
                name={member.name}
                position={member.position}
                bio={member.bio}
                image={member.image}
                social={member.socialLinks || {}}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}