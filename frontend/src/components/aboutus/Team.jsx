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
      <section className="py-24 bg-cream-200/70 dark:bg-haven-900 transition-colors duration-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-accent-500" />
          </div>
        </div>
      </section>
    );
  }

  if (error || teamMembers.length === 0) {
    return (
      <section className="py-24 bg-cream-200/70 dark:bg-haven-900 transition-colors duration-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="section-eyebrow">The People</p>
            <h2 className="section-title mt-3 mb-2">Meet Our Team</h2>
            <div className="section-divider" />
            <p className="text-haven-700/70 dark:text-cream-200/60 text-lg max-w-2xl mx-auto leading-relaxed">
              {error || "Our team members will be displayed here soon."}
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-cream-200/70 dark:bg-haven-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="section-eyebrow">The People</p>
          <h2 className="section-title mt-3 mb-2">Meet Our Team</h2>
          <div className="section-divider" />
          <p className="text-haven-700/70 dark:text-cream-200/60 text-lg max-w-2xl mx-auto leading-relaxed">
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
